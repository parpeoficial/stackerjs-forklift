import { unlinkSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { expect } from 'chai';
import { CLI } from "./../../bin/forklift";


describe.only('ForkliftTest', () => 
{

    before(() => exec('npm install -g'));

    describe('MVC', () => 
    {
        describe('MVC:Controller', () => 
        {
            describe('MVC:Controller:Create', () => 
            {
                it('Should create a JS Controller', () => 
                {
                    let response = CLI.retrieveMessages()
                        .exec(['mvc:controller:create', 'ExampleController.js', '-v'])
                        .retrieve();
    
                    expect(response).to.be.an('Array')
                        .and.contain('Creating ExampleController.js...')
                        .and.contain('Controller ExampleController created');
                });
    
                it('Should create a JS Controller without set type', () => 
                {
                    let response = CLI.retrieveMessages()
                        .exec(['mvc:controller:create', 'ExampleController'])
                        .retrieve();

                    expect(existsSync(process.cwd() + '/ExampleController.js')).to.be.true;
                });
    
                it('Should create a TS Controller', () => 
                {
                    let response = CLI.retrieveMessages()
                        .exec(['mvc:controller:create', 'ExampleController.ts', '-v'])
                        .retrieve();
    
                    expect(response).to.be.an('Array')
                        .and.contain('Creating ExampleController.ts...')
                        .and.contain('Controller ExampleController created');
                });
    
                it('Should create a TS Controller by setting type', () => 
                {
                    let response = CLI.retrieveMessages()
                        .exec(['mvc:controller:create', 'ExampleController', '--type=ts'])
                        .retrieve();

                    expect(existsSync('ExampleController.ts')).to.be.true;
                });

                it('Should present error when file type is not allowed', () => 
                {
                    let response = CLI.retrieveMessages()
                        .exec(['mvc:controller:create', 'ExampleController', '--type=jsx'])
                        .retrieve();

                    expect(response).to.have.property('file type');
                });

                afterEach(() => 
                {
                    if (existsSync('ExampleController.js'))
                        unlinkSync('ExampleController.js');

                    if (existsSync('ExampleController.ts'))
                        unlinkSync('ExampleController.ts');
                });
            });
        });

        describe('MVC:Entity', () => 
        {
            describe('MVC:Entity:Create', () => 
            {
                it('Should create a JS Entity', () => 
                {
                    CLI.retrieveMessages()
                        .exec(['mvc:entity:create', 'ExampleEntity.js', '-v'])
                        .retrieve();
    
                    expect(existsSync('ExampleEntity.js')).to.be.true;
                });

                it('Should create a JS Entity without set type', () => 
                {
                    CLI.retrieveMessages()
                        .exec(['mvc:entity:create', 'ExampleEntity', '-v'])
                        .retrieve();

                    expect(existsSync('ExampleEntity.js')).to.be.true;
                });

                it('Should create a TS Entity', () => 
                {
                    CLI.retrieveMessages()
                        .exec(['mvc:entity:create', 'ExampleEntity', '--type=ts'])
                        .retrieve();

                    expect(existsSync('ExampleEntity.ts')).to.be.true;
                });

                it('Should present error when file type not allowed', () => 
                {
                    let response = CLI.retrieveMessages()
                        .exec(['mvc:entity:create', 'ExampleEntity', '--type=xs'])
                        .retrieve();

                    expect(response).to.have.property('file type');
                });

                afterEach(() => 
                {
                    if (existsSync('ExampleEntity.js'))
                        unlinkSync('ExampleEntity.js');

                    if (existsSync('ExampleEntity.ts'))
                        unlinkSync('ExampleEntity.ts');
                });
            });
        });
    });

    describe('DB', () => 
    {
        describe('Migrate', () => 
        {
            describe('Create', () => 
            {
                
            });
        });
    });

});