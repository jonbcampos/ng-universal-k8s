import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import {Schema as ApplicationOptions} from '@schematics/angular/application/schema';
import {Schema as WorkspaceOptions} from '@schematics/angular/workspace/schema';

const collectionPath = path.join(__dirname, '../collection.json');

describe('ng-universal-k8s', () => {

    const schematicRunner = new SchematicTestRunner(
        '@schematics/angular',
        path.join(__dirname, '..', '..', 'node_modules', '@schematics', 'angular', 'collection.json')
    );

    const testRunner = new SchematicTestRunner(
        'schematics', collectionPath);

    describe('with project', () => {

        const workspaceOptions: WorkspaceOptions = {
            name: 'workspace',
            newProjectRoot: 'projects',
            version: '6.0.0',
        };

        const appOptions: ApplicationOptions = {
            name: 'bar',
            inlineStyle: false,
            inlineTemplate: false,
            routing: false,
            style: 'scss',
            skipTests: false,
            skipPackageJson: false,
        };

        let appTree: UnitTestTree;
        beforeEach(() => {
            appTree = schematicRunner.runSchematic('workspace', workspaceOptions);
            appTree = schematicRunner.runSchematic('application', appOptions, appTree);
        });

        describe('with @angular/universal', () => {

            beforeEach(() => {
                appTree = schematicRunner.runSchematic('universal', {
                    clientProject: appOptions.name
                }, appTree);
            });

            it('fails without app tree', () => {
                const runner = new SchematicTestRunner('schematics', collectionPath);
                expect(() => runner.runSchematic('ng-universal-k8s', {}, Tree.empty())).toThrow();
            });

            it('works', () => {
                const tree = testRunner.runSchematic('ng-universal-k8s', {
                    project: 'bar'
                }, appTree);

                //console.log(tree.readContent('/projects/bar/server.ts'));
                expect(tree.readContent('/projects/bar/server.ts')
                    .indexOf('/healthcheck'))
                    .toBeGreaterThanOrEqual(0);

                expect(tree.readContent('/projects/bar/server.ts')
                    .indexOf('/readiness'))
                    .toBeGreaterThanOrEqual(0);

                expect(tree.readContent('/projects/bar/server.ts')
                    .indexOf('SIGTERM'))
                    .toBeGreaterThanOrEqual(0);
                    
                expect(tree.readContent('/projects/bar/server.ts')
                    .indexOf('import {createLogger, format, transports} from \'winston\';'))
                    .toBeGreaterThanOrEqual(0);
                    
                expect(tree.files).toEqual([
                    '/README.md',
                    '/angular.json',
                    '/package.json',
                    '/tsconfig.json',
                    '/tslint.json',
                    '/.editorconfig',
                    '/.gitignore',
                    '/projects/bar/browserslist',
                    '/projects/bar/karma.conf.js',
                    '/projects/bar/tsconfig.app.json',
                    '/projects/bar/tsconfig.spec.json',
                    '/projects/bar/tslint.json',
                    '/projects/bar/tsconfig.server.json',
                    '/projects/bar/config.js',
                    '/projects/bar/server.ts',
                    '/projects/bar/webpack.server.config.js',
                    '/projects/bar/Dockerfile',
                    '/projects/bar/src/favicon.ico',
                    '/projects/bar/src/index.html',
                    '/projects/bar/src/main.ts',
                    '/projects/bar/src/polyfills.ts',
                    '/projects/bar/src/test.ts',
                    '/projects/bar/src/styles.scss',
                    '/projects/bar/src/main.server.ts',
                    '/projects/bar/src/assets/.gitkeep',
                    '/projects/bar/src/environments/environment.prod.ts',
                    '/projects/bar/src/environments/environment.ts',
                    '/projects/bar/src/app/app.module.ts',
                    '/projects/bar/src/app/app.component.scss',
                    '/projects/bar/src/app/app.component.html',
                    '/projects/bar/src/app/app.component.spec.ts',
                    '/projects/bar/src/app/app.component.ts',
                    '/projects/bar/src/app/app.server.module.ts',
                    '/projects/bar/k8s/deployment.yaml',
                    '/projects/bar/k8s/service.yaml',
                    '/projects/bar-e2e/protractor.conf.js',
                    '/projects/bar-e2e/tsconfig.e2e.json',
                    '/projects/bar-e2e/src/app.e2e-spec.ts',
                    '/projects/bar-e2e/src/app.po.ts'
                ]);
            });

        });

        describe('without @angular/universal', () => {

            it('works', () => {
                const tree = testRunner.runSchematic('ng-universal-k8s', {
                    project: 'bar'
                }, appTree);

                //console.log(tree.readContent('/projects/bar/server.ts'));
                expect(tree.readContent('/projects/bar/server.ts')
                    .indexOf('/healthcheck'))
                    .toBeGreaterThanOrEqual(0);

                expect(tree.readContent('/projects/bar/server.ts')
                    .indexOf('/readiness'))
                    .toBeGreaterThanOrEqual(0);

                expect(tree.readContent('/projects/bar/server.ts')
                    .indexOf('SIGTERM'))
                    .toBeGreaterThanOrEqual(0);
                    
                expect(tree.readContent('/projects/bar/server.ts')
                    .indexOf('import {createLogger, format, transports} from \'winston\';'))
                    .toBeGreaterThanOrEqual(0);

                expect(tree.files).toEqual([
                    '/README.md',
                    '/angular.json',
                    '/package.json',
                    '/tsconfig.json',
                    '/tslint.json',
                    '/.editorconfig',
                    '/.gitignore',
                    '/projects/bar/browserslist',
                    '/projects/bar/karma.conf.js',
                    '/projects/bar/tsconfig.app.json',
                    '/projects/bar/tsconfig.spec.json',
                    '/projects/bar/tslint.json',
                    '/projects/bar/tsconfig.server.json',
                    '/projects/bar/config.js',
                    '/projects/bar/server.ts',
                    '/projects/bar/webpack.server.config.js',
                    '/projects/bar/Dockerfile',
                    '/projects/bar/src/favicon.ico',
                    '/projects/bar/src/index.html',
                    '/projects/bar/src/main.ts',
                    '/projects/bar/src/polyfills.ts',
                    '/projects/bar/src/test.ts',
                    '/projects/bar/src/styles.scss',
                    '/projects/bar/src/main.server.ts',
                    '/projects/bar/src/assets/.gitkeep',
                    '/projects/bar/src/environments/environment.prod.ts',
                    '/projects/bar/src/environments/environment.ts',
                    '/projects/bar/src/app/app.module.ts',
                    '/projects/bar/src/app/app.component.scss',
                    '/projects/bar/src/app/app.component.html',
                    '/projects/bar/src/app/app.component.spec.ts',
                    '/projects/bar/src/app/app.component.ts',
                    '/projects/bar/src/app/app.server.module.ts',
                    '/projects/bar/k8s/deployment.yaml',
                    '/projects/bar/k8s/service.yaml',
                    '/projects/bar-e2e/protractor.conf.js',
                    '/projects/bar-e2e/tsconfig.e2e.json',
                    '/projects/bar-e2e/src/app.e2e-spec.ts',
                    '/projects/bar-e2e/src/app.po.ts'
                ]);
            });

        });

    });

    describe('without project', () => {

        const workspaceOptions: WorkspaceOptions = {
            name: 'workspace',
            newProjectRoot: 'projects',
            version: '6.0.0',
        };

        const appOptions: ApplicationOptions = {
            name: 'bar',
            projectRoot: '',
            inlineStyle: false,
            inlineTemplate: false,
            routing: false,
            style: 'scss',
            skipTests: false,
            skipPackageJson: false,
        };

        let appTree: UnitTestTree;
        beforeEach(() => {
            appTree = schematicRunner.runSchematic('workspace', workspaceOptions);
            appTree = schematicRunner.runSchematic('application', appOptions, appTree);
        });

        describe('with @angular/universal', () => {

            beforeEach(() => {
                appTree = schematicRunner.runSchematic('universal', {
                    clientProject: appOptions.name
                }, appTree);
            });

            it('works', () => {
                const tree = testRunner.runSchematic('ng-universal-k8s', {
                    project: 'bar'
                }, appTree);

                //console.log(tree.readContent('/server.ts'));
                expect(tree.readContent('/server.ts')
                    .indexOf('/healthcheck'))
                    .toBeGreaterThanOrEqual(0);

                expect(tree.readContent('/server.ts')
                    .indexOf('/readiness'))
                    .toBeGreaterThanOrEqual(0);

                expect(tree.readContent('/server.ts')
                    .indexOf('SIGTERM'))
                    .toBeGreaterThanOrEqual(0);
                    
                expect(tree.readContent('/server.ts')
                    .indexOf('import {createLogger, format, transports} from \'winston\';'))
                    .toBeGreaterThanOrEqual(0);

                expect(tree.files).toEqual([
                    '/README.md',
                    '/angular.json',
                    '/package.json',
                    '/tsconfig.json',
                    '/tslint.json',
                    '/.editorconfig',
                    '/.gitignore',
                    '/config.js',
                    '/server.ts',
                    '/webpack.server.config.js',
                    '/Dockerfile',
                    '/src/favicon.ico',
                    '/src/index.html',
                    '/src/main.ts',
                    '/src/polyfills.ts',
                    '/src/test.ts',
                    '/src/styles.scss',
                    '/src/browserslist',
                    '/src/karma.conf.js',
                    '/src/tsconfig.app.json',
                    '/src/tsconfig.spec.json',
                    '/src/tslint.json',
                    '/src/main.server.ts',
                    '/src/tsconfig.server.json',
                    '/src/assets/.gitkeep',
                    '/src/environments/environment.prod.ts',
                    '/src/environments/environment.ts',
                    '/src/app/app.module.ts',
                    '/src/app/app.component.scss',
                    '/src/app/app.component.html',
                    '/src/app/app.component.spec.ts',
                    '/src/app/app.component.ts',
                    '/src/app/app.server.module.ts',
                    '/e2e/protractor.conf.js',
                    '/e2e/tsconfig.e2e.json',
                    '/e2e/src/app.e2e-spec.ts',
                    '/e2e/src/app.po.ts',
                    '/k8s/deployment.yaml',
                    '/k8s/service.yaml'
                ]);
            });

        });

        describe('without @angular/universal', () => {

            it('works', () => {
                const tree = testRunner.runSchematic('ng-universal-k8s', {
                    project: 'bar'
                }, appTree);

                //console.log(tree.readContent('/server.ts'));
                expect(tree.readContent('/server.ts')
                    .indexOf('/healthcheck'))
                    .toBeGreaterThanOrEqual(0);

                expect(tree.readContent('/server.ts')
                    .indexOf('/readiness'))
                    .toBeGreaterThanOrEqual(0);

                expect(tree.readContent('/server.ts')
                    .indexOf('SIGTERM'))
                    .toBeGreaterThanOrEqual(0);
                    
                expect(tree.readContent('/server.ts')
                    .indexOf('import {createLogger, format, transports} from \'winston\';'))
                    .toBeGreaterThanOrEqual(0);

                expect(tree.files).toEqual([
                    '/README.md',
                    '/angular.json',
                    '/package.json',
                    '/tsconfig.json',
                    '/tslint.json',
                    '/.editorconfig',
                    '/.gitignore',
                    '/config.js',
                    '/server.ts',
                    '/webpack.server.config.js',
                    '/Dockerfile',
                    '/src/favicon.ico',
                    '/src/index.html',
                    '/src/main.ts',
                    '/src/polyfills.ts',
                    '/src/test.ts',
                    '/src/styles.scss',
                    '/src/browserslist',
                    '/src/karma.conf.js',
                    '/src/tsconfig.app.json',
                    '/src/tsconfig.spec.json',
                    '/src/tslint.json',
                    '/src/main.server.ts',
                    '/src/tsconfig.server.json',
                    '/src/assets/.gitkeep',
                    '/src/environments/environment.prod.ts',
                    '/src/environments/environment.ts',
                    '/src/app/app.module.ts',
                    '/src/app/app.component.scss',
                    '/src/app/app.component.html',
                    '/src/app/app.component.spec.ts',
                    '/src/app/app.component.ts',
                    '/src/app/app.server.module.ts',
                    '/e2e/protractor.conf.js',
                    '/e2e/tsconfig.e2e.json',
                    '/e2e/src/app.e2e-spec.ts',
                    '/e2e/src/app.po.ts',
                    '/k8s/deployment.yaml',
                    '/k8s/service.yaml'
                ]);
            });

        });

    });

});
