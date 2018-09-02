import {
    apply,
    chain,
    MergeStrategy,
    mergeWith,
    move,
    Rule,
    SchematicContext, SchematicsException,
    template,
    Tree, url
} from '@angular-devkit/schematics';
import {getWorkspace} from '@schematics/angular/utility/config';
import {join, Path, strings} from '@angular-devkit/core';
import {addPackageJsonDependency, NodeDependencyType} from "../utils/dependencies";
import {addScriptIntoPackageJson} from "../utils/json-editor";
import * as ts from 'typescript';

function updateServer(projectRoot:Path){
    return (tree: Tree) => {
        const filePath =  join(projectRoot, 'server.ts');
        const text = tree.read(filePath );
        if (text === null) {
            throw new SchematicsException(`File ${filePath} does not exist.`);
        }
        const sourceText = text.toString('utf-8');
        const source = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
        //console.log(source);
        // make change
        const recorder = tree.beginUpdate(filePath);
        const nodes = findNodes(source, ts.SyntaxKind.ExpressionStatement);
        // TODO add check if it already exists
        const content = '\n' +
            '\n' +
            'import * as healthCheck from \'express-healthcheck\';\n' +
            '\n' +
            '// add healthcheck\n' +
            'app.use(\'/healthcheck\', healthCheck());\n' +
            '\n' +
            '// add readiness check\n' +
            'app.use(\'/readiness\', function (req, res, next) {\n' +
            '    res.status(200).json({ ready: true });\n' +
            '});\n' +
            '\n' +
            '// respond to termination requests\n' +
            'process.on(\'SIGTERM\', function () {\n' +
            '    // TODO: cleanup environment, this is about to be shut down\n' +
            '    process.exit(0);\n' +
            '});';
        let found = false;
        nodes.forEach(node => {
            if (node.getText().indexOf('\'*.*\'') > -1) {
                const start = node.pos;
                recorder.insertLeft(start, new Buffer(content));
                found = true;
            }
        });
        if(!found){
            nodes.forEach(node => {
                if (node.getText().indexOf('app.listen(PORT') > -1) {
                    const start = node.pos;
                    recorder.insertLeft(start, new Buffer(content));

                }
            });
        }
        tree.commitUpdate(recorder);

        return tree;
    };
}

export function findNodes(node: ts.Node, kind: ts.SyntaxKind, max = Infinity): ts.Node[] {
    if (!node || max == 0) {
        return [];
    }

    const arr: ts.Node[] = [];
    if (node.kind === kind) {
        arr.push(node);
        max--;
    }
    if (max > 0) {
        for (const child of node.getChildren()) {
            findNodes(child, kind, max).forEach(node => {
                if (max > 0) {
                    arr.push(node);
                }
                max--;
            });

            if (max <= 0) {
                break;
            }
        }
    }

    return arr;
}

function addScriptsToPackageJson() {
    return (tree: Tree) => {
        [{
            key: 'start-prod',
            value: 'yarn build && cd dist/browser && http-server -c-1'
        }, {
            key: 'build:ssr',
            value: 'yarn run build:client-and-server-bundles && yarn run webpack:server'
        }, {
            key: 'serve:ssr',
            value: 'node dist/server'
        }, {
            key: 'build:client-and-server-bundles',
            value: 'ng build --prod && ng run browser:server'
        }].forEach(script => addScriptIntoPackageJson(tree, script));
        return tree;
    }
}

function addToPackage() {
    return (tree: Tree) => {
        [{
            type: NodeDependencyType.Default,
            name: 'express-healthcheck',
            version: '^0.1.0'
        }].forEach(dependency => addPackageJsonDependency(tree, dependency));
        return tree;
    }
}

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function addK8s(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const workspace = getWorkspace(tree);
        if (!workspace) {
            throw new SchematicsException('workspace is required.');
        }
        const project = workspace.projects[options.project];
        if (!project) {
            throw new SchematicsException('Option "project" is required.');
        }
        if (project.projectType !== 'application') {
            throw new SchematicsException(`ng-universal-k8s requires a project type of "application".`);
        }
        const projectRoot = project.root as Path;

        const templateOptions = {
            ...strings,
            ...options,
        };

        const rule = chain([
            addToPackage(),
            addScriptsToPackageJson(),
            updateServer(projectRoot),
            mergeWith(apply(url('./files'), [
                template(templateOptions),
                move(projectRoot),
            ]), MergeStrategy.Default)
        ]);
        return rule(tree, _context);
    };
}
