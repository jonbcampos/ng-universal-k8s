import {
    chain,
    Rule,
    SchematicContext, SchematicsException,
    Tree
} from '@angular-devkit/schematics';
import {getWorkspace} from '@schematics/angular/utility/config';
import {join, Path} from '@angular-devkit/core';
import {addPackageJsonDependency, NodeDependencyType} from "../utils/dependencies";
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
            '// create logger\n' +
            'import {createLogger, format, transports} from \'winston\';\n' +
            '\n' +
            '// attach logger\n' +
            'const logger = createLogger({\n' +
            '   level: \'info\', // log at info and above\n' +
            '   format: format.combine(\n' +
            '       format.timestamp(),\n' +
            '       format.json()\n' +
            '   ),\n' +
            '   transports: [\n' +
            '       // log to the console\n' +
            '       new transports.Console()\n' +
            '   ]\n' +
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

function addToPackage() {
    return (tree: Tree) => {
        [{
            type: NodeDependencyType.Default,
            name: 'winston',
            version: '^3.1.0'
        }].forEach(dependency => addPackageJsonDependency(tree, dependency));
        return tree;
    }
}

export function addLogging(options: any): Rule {
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

        const rule = chain([
            addToPackage(),
            updateServer(projectRoot)
        ]);
        return rule(tree, _context);
    };
}
