import { existsSync, mkdirSync, writeFileSync, readdirSync } from "fs";
import { DB } from "stackerjs-db";
import { SNAKECASEFY, GETSAMPLE } from "./Utils";

const MIGRATIONSFOLDER = `${process.cwd()}/storage/database/migrations`;

export const dbMigrateCreate = async scope => 
{
    createMigrationsFolderIfNotExists(scope);
    await createMigrationStructureIfNotExists(scope);

    if (!scope.hasErrors()) 
    {
        let params = scope.getRoute().getParams(),
            options = scope.getRoute().getOptions();

        let FILENAME =
                new Date().getTime().toString() +
                "_" +
                SNAKECASEFY(params.migration_name),
            CONTENT = GETSAMPLE("db/migrate.js.sample");

        await insertMigration({ name: FILENAME });
        writeFileSync(`${MIGRATIONSFOLDER}/${FILENAME}.js`, CONTENT);

        if (options["-v"]) scope.message(`Created migration ${FILENAME}`);
    }

    return scope;
};

export const dbMigrateList = scope =>
    findMigrationBy().then(results => 
    {
        results.forEach((migration, index) => 
        {
            scope.message(`Name: ${migration.name}`);
            scope.message(`Migrated at: ${
                migration.migrated_at ? migration.migrated_at : "waiting..."
            }`);

            if (index < results.length - 1) scope.message("=============");
        });

        return scope;
    });

export const dbMigrateUp = scope => 
{
    let options = scope.getRoute().getOptions(),
        migratedAt = Math.ceil(new Date().getTime() / 1000);

    return Promise.all(readdirSync(MIGRATIONSFOLDER).map(migration => 
    {
        migration = migration.slice(0, -3);
        return findMigrationBy("name", migration).then(([result]) => 
        {
            if (result) return result;

            return insertMigration({ name: migration });
        });
    }))
        .then(migrations =>
            Promise.all(migrations
                .filter(migration => !migration.migrated_at)
                .map(async migration => 
                {
                    let script = loadMigration(migration.name);

                    if (options["-v"])
                        scope.message(`Upgrading ${migration.name}...`);

                    try 
                    {
                        await script.up();

                        migration.migrated_at = migratedAt;
                        await updateMigration(migration);

                        if (options["-v"])
                            scope.message(`Upgraded ${migration.name}...`);
                    }
                    catch (err) 
                    {
                        if (options["-v"]) scope.error(err.message);

                        scope.error(`Error migrating ${migration.name}`);
                    }

                    return migration;
                })))
        .then(() => scope);
};

export const dbMigrateDown = scope => 
{
    let queryBuilder = DB.Factory.getQueryBuilder(),
        options = scope.getRoute().getOptions();

    return findMigrationBy(
        "migrated_at",
        queryBuilder
            .select()
            .set("migrated_at")
            .from("migrations")
            .where({ migrated_at: { neq: null } })
            .order(["name", "DESC"])
            .limit(1)
    ).then(results => 
    {
        return Promise.all(results.map(async migration => 
        {
            let script = loadMigration(migration.name);

            if (options["-v"])
                scope.message(`Downgrading ${migration.name}...`);

            try 
            {
                await script.down();

                migration.migrated_at = null;
                await updateMigration(migration);

                if (options["-v"])
                    scope.message(`Downgraded ${migration.name}...`);
            }
            catch (err) 
            {
                throw new Error(`${migration.name}`, err.message);
            }
        }))
            .catch(err => scope.error(err.message))
            .then(() => scope);
    });
};

const insertMigration = migration =>
    DB.Factory.getQueryBuilder()
        .insert()
        .into("migrations")
        .set(migration)
        .execute()
        .then(response => 
        {
            migration.id = response.lastInsertedId;
            return migration;
        });

const updateMigration = migration =>
    DB.Factory.getQueryBuilder()
        .update()
        .into("migrations")
        .set(migration)
        .where({ id: migration.id })
        .execute()
        .then(() => migration);

const findMigrationBy = (field, value) => 
{
    let filters = {};
    if (field && value) filters[field] = value;

    return DB.Factory.getQueryBuilder()
        .select()
        .set("*")
        .from("migrations")
        .where(filters)
        .order("name")
        .execute();
};

const createMigrationsFolderIfNotExists = scope => 
{
    let options = scope.getRoute().getOptions();

    if (!existsSync(MIGRATIONSFOLDER)) 
    {
        if (options["-v"]) scope.message("Creating migrations folder...");

        mkdirSync(`${process.cwd()}/storage`);
        mkdirSync(`${process.cwd()}/storage/database`);
        mkdirSync(`${process.cwd()}/storage/database/migrations`);
    }
};

const createMigrationStructureIfNotExists = async scope => 
{
    let options = scope.getRoute().getOptions();

    let queryBuilder = DB.Factory.getQueryBuilder();
    if (!queryBuilder) scope.error("database", "Database connection not found");

    if (
        !await queryBuilder
            .table()
            .exists("migrations")
            .execute()
    ) 
    {
        if (options["-v"]) scope.message("Creating migrations structure");

        await queryBuilder
            .table()
            .create("migrations")
            .set({
                id: { type: "pk", required: true },
                name: { type: "varchar", size: 250, required: true },
                migrated_at: { type: "integer" }
            })
            .execute();
    }
};

const loadMigration = migration => require(`${MIGRATIONSFOLDER}/${migration}`);
