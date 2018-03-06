import { rmdirSync, unlinkSync, readdirSync } from 'fs';
import { exec } from 'child_process';
import { expect } from 'chai';
import { DB } from 'stackerjs-db';
import { CLI } from "./../../../bin/forklift";


describe('Unit/DB/MigrateTest', function ()  
{

    this.timeout(4000);
    describe('DB:Migrate:Create', () => 
    {
        it('Should create a migration script', done => 
        {
            CLI.retrieveMessages()
                .exec(['db:migrate:create', 'createTableUsers', '-v'])
                .then(scope => scope.retrieve())
                .then(response => 
                    expect(readdirSync(`${process.cwd()}/storage/database/migrations`)).to.be.lengthOf(1))
                .then(() => done());
        });
    });

    describe('DB:Migrate:List', () => 
    {
        it('Should list all migrations', done => 
        {
            CLI.retrieveMessages()
                .exec(['db:migrate:list'])
                .then(scope => scope.retrieve())
                .then(response => {
                    expect(response.slice(9))
                        .to.contain('Migrated at: waiting...');
                })
                .then(() => done());
        });
    });

    describe("DB:Migrate:Up", () => 
    {
        it('Should make a migration up', done => 
        {
            CLI.retrieveMessages()
                .exec(['db:migrate:up', '-v'])
                .then(scope => scope.retrieve())
                .then(response => 
                    response.slice(9).forEach(message => 
                        expect(message).to.match(/^Migrat/)))
                .then(() => done());
        });
    });

    after(() => 
    {
        readdirSync(`${process.cwd()}/storage/database/migrations`)
            .forEach(migration => 
                unlinkSync(`${process.cwd()}/storage/database/migrations/${migration}`));
        
        rmdirSync(`${process.cwd()}/storage/database/migrations`);
        rmdirSync(`${process.cwd()}/storage/database`);
        rmdirSync(`${process.cwd()}/storage`);

        DB.Factory.getQueryBuilder()
            .table()
            .drop('migrations')
            .execute();
    });

});