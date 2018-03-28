import * as fs from "fs";
import { ALLOWED_TYPES, REGEX_TYPE, SNAKECASEFY, GETSAMPLE } from "./Utils";

export const mvcControllerCreate = scope => 
{
    let options = scope.getRoute().getOptions(),
        params = scope.getRoute().getParams();

    if (options["-v"]) scope.message(`Creating ${params.controller_name}...`);

    const TYPE = options["--type"]
        ? options["--type"]
        : REGEX_TYPE.test(params.controller_name)
            ? REGEX_TYPE.exec(params.controller_name)[1]
            : "js";

    if (ALLOWED_TYPES.indexOf(TYPE) < 0)
        scope.error("file type", "Type not allowed");

    if (!scope.hasErrors()) 
    {
        const CONTROLLER_NAME = params.controller_name.replace(REGEX_TYPE, ""),
            CONTROLLER_SAMPLE = GETSAMPLE(`mvc/controller.${TYPE}.sample`);

        fs.writeFileSync(
            `${process.cwd()}/${CONTROLLER_NAME}.${TYPE}`,
            CONTROLLER_SAMPLE.replace(/_CONTROLLER_NAME_/g, CONTROLLER_NAME)
        );
        if (options["-v"])
            scope.message(`Controller ${CONTROLLER_NAME} created`);
    }

    return scope;
};

export const mvcEntityCreate = scope => 
{
    let options = scope.getRoute().getOptions(),
        params = scope.getRoute().getParams();

    if (options["-v"]) scope.message(`Creating ${params.entity_name}...`);

    const TYPE = options["--type"]
        ? options["--type"]
        : REGEX_TYPE.test(params.entity_name)
            ? REGEX_TYPE.exec(params.entity_name)[1]
            : "js";

    if (ALLOWED_TYPES.indexOf(TYPE) < 0)
        scope.error("file type", "Type not allowed");

    if (!scope.hasErrors()) 
    {
        const ENTITY_NAME = params.entity_name.replace(REGEX_TYPE, ""),
            ENTITY_SAMPLE = GETSAMPLE(`mvc/entity.${TYPE}.sample`);

        fs.writeFileSync(
            `${process.cwd()}/${ENTITY_NAME}.${TYPE}`,
            ENTITY_SAMPLE.replace(/_ENTITY_NAME_/g, ENTITY_NAME)
                .replace(/_ENTITY_TABLE_NAME_/g, SNAKECASEFY(ENTITY_NAME))
                .replace(/_ENTITY_FIELDS_/, "[]")
                .replace(/_ENTITY_RELATIONS_/, "[]")
        );
        if (options["-v"]) scope.message(`Entity ${ENTITY_NAME} created`);
    }

    return scope;
};
