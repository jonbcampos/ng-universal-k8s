import {JsonAstObject, JsonParseMode, parseJsonAst} from '@angular-devkit/core';
import {SchematicsException, Tree} from '@angular-devkit/schematics';
import {
    appendPropertyInAstObject,
    findPropertyInAstObject,
    insertPropertyInAstObjectInOrder,
} from './json-utils';

const pkgJsonPath = '/package.json';

export interface NodeKeyValue {
    key: string;
    value: string | boolean | number;
}

export function readValueFromPackageJson(host: Tree, key: string): any {
    const packageJsonAst = _readJson(host, pkgJsonPath);
    let node = findPropertyInAstObject(packageJsonAst, key);
    return node;
}

export function addScriptIntoPackageJson(host: Tree, script: NodeKeyValue): Tree {
    const packageJsonAst = _readJson(host, pkgJsonPath);
    const scriptsNode = findPropertyInAstObject(packageJsonAst, 'scripts');
    const recorder = host.beginUpdate(pkgJsonPath);
    if (!scriptsNode) {
        // Haven't found the scripts key, add it to the root of the package.json.
        appendPropertyInAstObject(recorder, packageJsonAst, 'scripts', {
            [script.key]: script.value.toString(),
        }, 2);
    } else if (scriptsNode.kind === 'object') {
        const scriptNode = findPropertyInAstObject(scriptsNode, script.key);
        if (!scriptNode) {
            insertPropertyInAstObjectInOrder(recorder, scriptsNode, script.key, script.value.toString(), 4);
        } else {
            // found, we need to overwrite
            const {end, start} = scriptNode;
            recorder.remove(start.offset, end.offset - start.offset);
            recorder.insertRight(start.offset, script.value.toString());
        }
    }
    host.commitUpdate(recorder);
    return host;
}

function _readJson(tree: Tree, path: string): JsonAstObject {
    const buffer = tree.read(path);
    if (buffer === null) {
        throw new SchematicsException(`Could not read ${path}.`);
    }
    const content = buffer.toString();

    const json = parseJsonAst(content, JsonParseMode.Strict);
    if (json.kind != 'object') {
        throw new SchematicsException(`Invalid ${path}. Was expecting an object`);
    }

    return json;
}