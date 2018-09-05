import {
    apply,
    chain,
    externalSchematic, MergeStrategy,
    mergeWith, move,
    noop,
    Rule,
    schematic,
    SchematicContext, SchematicsException, template,
    Tree, url
} from '@angular-devkit/schematics';
import {Path} from "@angular-devkit/core";
import {getWorkspace} from '@schematics/angular/utility/config';
import * as strings from "../../node_modules/@angular-devkit/core/src/utils/strings";
import {addPackageJsonDependency, NodeDependencyType} from "../utils/dependencies";
import {readValueFromPackageJson} from "../utils/json-editor";

function addToPackage() {
    return (tree: Tree) => {
        [{
            type: NodeDependencyType.Default,
            name: 'domino',
            version: '^2.1.0'
        }, {
            type: NodeDependencyType.Dev,
            name: 'webpack-cli',
            version: '^3.1.0'
        }, {
            type: NodeDependencyType.Dev,
            name: 'webpack',
            version: '^4.x.x'
        }, {
            type: NodeDependencyType.Default,
            name: '@nguniversal/express-engine',
            version: '^6.1.0'
        }, {
            type: NodeDependencyType.Default,
            name: '@nguniversal/express',
            version: '^4.15.2'
        }, {
            type: NodeDependencyType.Default,
            name: '@nguniversal/module-map-ngfactory-loader',
            version: '^6.1.0'
        }, {
            type: NodeDependencyType.Default,
            name: 'ts-loader',
            version: '^5.0.0'
        }, {
            type: NodeDependencyType.Default,
            name: 'nconf',
            version: '^0.10.0'
        }].forEach(dependency => addPackageJsonDependency(tree, dependency));
        return tree;
    }
}

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function ngUniversalK8s(options: any): Rule {
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
        const projectName = readValueFromPackageJson(tree, 'name').value;

        const templateOptions = {
            ...strings,
            projectName,
            ...options,
        };

        const hasMainServer = tree.exists('/src/main.server.ts') ||
            tree.exists('/projects/bar/src/main.server.ts');

        const hasServer = tree.exists('/server.ts') ||
            tree.exists('/projects/bar/server.ts');

        const rule = chain([
            hasMainServer ? noop() : externalSchematic('@schematics/angular', 'universal', {
                clientProject: options.project
            }),
            hasServer ? noop() : mergeWith(apply(url('./files'), [
                template(templateOptions),
                move(projectRoot),
            ]), MergeStrategy.Default),
            hasServer ? noop() : addToPackage(),
            schematic('add-k8s', {
                project: options.project,
                containerPort: options.containerPort
            }),
            !options.includeLogging ? noop() : schematic('add-logging', {
                project: options.project
            })
        ]);
        return rule(tree, _context);
    };
}
