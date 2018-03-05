#!/usr/bin/env node
import * as child from 'child_process';
import { writeFile, readFileSync } from 'fs';
import { AppCLI } from '../lib';
import { mvcControllerCreate, mvcEntityCreate } from '../lib/Commands/MVC';


const PARAMS = process.argv.filter(arg => arg.substr(-4) !== 'node' && arg.substr(-8) !== 'node.exe')
                    .filter(arg => arg.indexOf('/forklift') < 0)
                    .filter(arg => arg.indexOf('\\forklift') < 0);


export const CLI = new AppCLI()
    .register('mvc:controller:create {controller_name}', mvcControllerCreate)
    .register('mvc:entity:create {entity_name}', mvcEntityCreate);

if (Object.keys(process.mainModule.exports).length >= 0)
    CLI.exec(PARAMS);