import { existsSync, mkdirSync, writeFileSync } from "fs";
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

        await DB.Factory.getQueryBuilder()
            .insert()
            .into("migrations")
            .set("name", FILENAME)
            .execute();
        writeFileSync(`${MIGRATIONSFOLDER}/${FILENAME}.js`, CONTENT);

        if (options["-v"]) scope.message(`Created migration ${FILENAME}`);
    }

    return scope;
};

export const dbMigrateList = scope =>
    DB.Factory.getQueryBuilder()
        .select()
        .set("*")
        .from("migrations")
        .execute()
        .then(results => 
        {
            results.forEach((migration, index) => 
            {
                scope.message(`Name: ${migration.name}`);
                scope.message(`Migrated at: ${
                    migration.migrated_at
                        ? migration.migrated_at
                        : "waiting..."
                }`);

                if (index < results.length - 1) scope.message("=============");
            });

            return scope;
        });

export const dbMigrateUp = scope =>
    DB.Factory.getQueryBuilder()
        .select()
        .set("*")
        .from("migrations")
        .where("migrated_at is null")
        .execute()
        .then(results => 
        {
            let options = scope.getRoute().getOptions(),
                queryBuilder = DB.Factory.getQueryBuilder(),
                migratedAt = new Date();

            return Promise.all(results.map(async migration => 
            {
                let script = loadMigration(migration.name);

                if (options["-v"])
                    scope.message(`Upgrading ${migration.name}...`);

                try 
                {
                    await script.up();
                    await queryBuilder
                        .update()
                        .into("migrations")
                        .set("migrated_at", migratedAt)
                        .where({ id: migration.id })
                        .execute();
                }
                catch (err) 
                {
                    throw new Error(`Error migrating ${migration.name}`);
                }

                if (options["-v"])
                    scope.message(`Upgraded ${migration.name}...`);
            }))
                .catch(err => scope.error(err.message))
                .then(() => scope);
        });

export const dbMigrateDown = scope => 
{
    let queryBuilder = DB.Factory.getQueryBuilder();

    return queryBuilder
        .select()
        .set("*")
        .from("migrations")
        .where({
            migrated_at: queryBuilder
                .select()
                .set("migrated_at")
                .from("migrations")
                .order(["name", "DESC"])
                .limit(1),
        })
        .order("name")
        .execute()
        .then(results => 
        {
            let options = scope.getRoute().getOptions();

            return Promise.all(results.map(async migration => 
            {
                let script = loadMigration(migration.name);

                if (options["-v"])
                    scope.message(`Downgrading ${migration.name}...`);

                try 
                {
                    await script.down();
                    await queryBuilder
                        .update()
                        .into("migrations")
                        .set("migrated_at", null)
                        .where({ id: migration.id })
                        .execute();
                }
                catch (err) 
                {
                    console.log(err.message);
                    throw new Error(`${migration.name}`, err.message);
                }

                if (options["-v"])
                    scope.message(`Downgraded ${migration.name}...`);
            }))
                .catch(err => scope.error(err.message))
                .then(() => scope);
        });
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

    if (!scope.hasErrors()) 
    {
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
                    migrated_at: { type: "datetime" },
                })
                .execute();
        }
    }
};

const loadMigration = migration => require(`${MIGRATIONSFOLDER}/${migration}`);
