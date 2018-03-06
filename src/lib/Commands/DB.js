import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { DB } from 'stackerjs-db';
import { 
    ALLOWED_TYPES, 
    REGEX_TYPE,
    SNAKECASEFY,
    GETSAMPLE
} from './Utils';


const MIGRATIONSFOLDER = `${process.cwd()}/storage/database/migrations`;


export const dbMigrateCreate = async scope =>
{
    createMigrationsFolderIfNotExists(scope);
    await createMigrationStructureIfNotExists(scope);

    if (!scope.hasErrors()) {
        let params = scope.getRoute().getParams(),
            options = scope.getRoute().getOptions();

        let FILENAME = new Date().getTime().toString() + '_' + SNAKECASEFY(params.migration_name),
            CONTENT = GETSAMPLE('db/migrate.js.sample');

        await DB.Factory.getQueryBuilder()
            .insert()
            .into('migrations')
            .set('name', FILENAME)
            .execute();
        writeFileSync(`${MIGRATIONSFOLDER}/${FILENAME}.js`, CONTENT);

        if (options['-v'])
            scope.message(`Created migration ${FILENAME}`);
    }

    return scope;
}


export const dbMigrateList = scope => DB.Factory.getQueryBuilder()
    .select().set('*').from('migrations').execute()
    .then(results => {
        results.forEach((migration, index) => {
            scope.message(`Name: ${migration.name}`);
            scope.message(`Migrated at: ${migration.migrated_at ? migration.migrated_at : "waiting..."}`);

            if (index < results.length - 1)
                scope.message('=============');
        });

        return scope;
    });


export const dbMigrateUp = scope => DB.Factory.getQueryBuilder()
    .select().set('*').from('migrations').where('migrated_at is null').execute()
    .then(results => {
        let queryBuilder = DB.Factory.getQueryBuilder(),
            migratedAt = new Date();

        return Promise.all(results.map(async migration => {
            let script = loadMigration(migration.name);
            await script.up();
            await queryBuilder.update().into('migrations')
                .set('migrated_at', migratedAt)
                .where({ 'id': migration.id })
                .execute();
        }))
        .catch(err => scope.error(err.message))
        .then(() => scope);
    });


export const dbMigrateDown = scope =>
{

    return scope;
}


const createMigrationsFolderIfNotExists = scope =>
{
    let options = scope.getRoute().getOptions();

    if (!existsSync(MIGRATIONSFOLDER)) {
        if (options['-v'])
            scope.message('Creating migrations folder...');

        mkdirSync(`${process.cwd()}/storage`);
        mkdirSync(`${process.cwd()}/storage/database`);
        mkdirSync(`${process.cwd()}/storage/database/migrations`);
    }
}


const createMigrationStructureIfNotExists = async scope =>
{
    let options = scope.getRoute().getOptions();

    let queryBuilder = DB.Factory.getQueryBuilder();
    if (!queryBuilder)
        scope.error('database', 'Database connection not found');

    if (!scope.hasErrors()) {
        if (!await queryBuilder.table().exists('migrations').execute()) {
            if (options['-v'])
                scope.message('Creating migrations structure');

            await queryBuilder.table().create('migrations').set({
                'id': { 'type': 'pk', 'required': true },
                'name': { 'type': 'varchar', 'size': 250, 'required': true },
                'migrated_at': { 'type': 'datetime' }
            }).execute();
        }
    }
}


const loadMigration = migration => require(`${MIGRATIONSFOLDER}/${migration}`);