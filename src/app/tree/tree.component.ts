import { Component, OnInit, NgModule, Inject, Injectable, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { LocationStrategy, PlatformLocation, Location } from '@angular/common';
import { Wakanda } from '../wakanda.service';
import { ApiService } from '../shared/api.service';
import { AppComponent } from '../app.component';
import { TreeNode } from 'primeng/api';

@Component({
    selector: 'app-tree',
    templateUrl: './tree.component.html',
    styleUrls: ['./tree.component.css']
})
export class TreeComponent implements OnInit {

    public data: TreeNode[];
    public dataClasses = [];
    public selectedDataClass: any;
    public selectedID: string;
    public firstNode: any;

    constructor(
        private wakanda: Wakanda,
        private apiService: ApiService,
        private core: AppComponent
    ) {
        this.apiService.dataClassesStoreChanges.pluck('allDataClasses').subscribe(
            allDataClasses => {
                this.dataClasses = (allDataClasses as Array<any>).map(
                    dc => {
                        return { label: dc.name, value: dc };
                    }
                );
                if (this.dataClasses && this.dataClasses.length > 0) {
                    this.selectedDataClass = this.dataClasses[0].value;
                }
            }
        );
    }

    ngOnInit() {
        this.data = [];
    }

    initialLoad() {
        if (this.selectedDataClass && this.selectedID && this.selectedID.trim().length > 0) {
            this.data = [];
            Observable.fromPromise(this._getPrimaryKey({ dataClass: this.selectedDataClass })).subscribe(
                key => {
                    Observable.fromPromise(this.selectedDataClass.find(this.selectedID)).subscribe(
                        res => {
                            this.data.push(this.getEntityAsNode({ entity: res, key: key }));
                        }
                    );
                },
                err => {
                    this.core._setGrwolMsg({
                        severity: 'error',
                        summary: 'Primary key detection failed!',
                        detail: 'Error: ' + err + ' !'
                    });
                }
            );
        } else {
            this.core._setGrwolMsg({
                severity: 'error',
                summary: 'Start tree structure',
                detail: 'No data class selected!'
            });
        }
    }

    _getPrimaryKey(params) {
        return new Promise((resolve) => {
            const kbv = function getKeyByValue(object, value) {
                const keys = Object.keys(object);
                keys.splice(keys.indexOf('_key'), 1);
                return keys.find(key => {
                    // tslint:disable-next-line:triple-equals
                    return object[key] == value;
                });
            };
            let entity = {};
            Observable.fromPromise(params.dataClass.query({ filter: '', pageSize: 1 })).subscribe(
                res => {
                    if (res['entities'] && res['entities'].length === 1) {
                        entity = res['entities'][0];
                    }
                },
                err => {
                    this.core._setGrwolMsg({
                        severity: 'error',
                        summary: 'Start tree structure',
                        detail: 'No data class selected!'
                    });
                },
                () => {
                    const key = kbv(entity, entity['_key']);
                    resolve(key);
                }
            );
        });
    }

    loadNode(event) {
        switch (event.node.entityType) {
            case 'Entity':
                Observable.fromPromise(event.node.entity.fetch()).subscribe(
                    res => {
                        event.node.children = this.getEntityAsNode({ entity: res })['children'];
                    },
                    err => {
                        this.core._setGrwolMsg({
                            severity: 'error',
                            summary: 'Entity expansion failed!',
                            detail: 'Error: ' + err + ' !'
                        });
                    }
                );
                break;
            case 'Collection':
                Observable.fromPromise(event.node.entity.fetch()).subscribe(
                    res => {
                        event.node.children = res['entities'].map(
                            e => {
                                return this.getEntityAsNode({ entity: e });
                            }
                        );
                    },
                    err => {
                        this.core._setGrwolMsg({
                            severity: 'error',
                            summary: 'Entity expansion failed!',
                            detail: 'Error: ' + err + ' !'
                        });
                    }
                );
                break;
        }
    }

    getEntityAsNode(params) {
        const node = {
            label: params.entity._dataClass.name + ' (' + params.entity._key + ')',
            data: params.entity[params.entity._key],
            leaf: true
        };
        let nodeChildren: TreeNode[];

        nodeChildren = Object.keys(params.entity).map(
            key => {
                let _node;
                if (key !== '_deferred' && key !== '_key' && key !== '_stamp') {
                    _node = {};
                    if (params.entity[key] && params.entity[key]['__proto__'] && params.entity[key]['__proto__']['constructor']) {
                        _node['entityType'] = params.entity[key]['__proto__']['constructor'].name;
                        if (_node['entityType'] === 'Media') {
                            _node['label'] = '<b>' + key + '</b> (' + _node['entityType'] + '): ' + params.entity[key]['uri'];
                        }
                        if (_node['entityType'] === 'Date') {
                            _node['label'] = '<b>' + key + '</b>: ' + params.entity[key].toString();
                        }
                        if (_node['entityType'] === 'Object') {
                            _node['label'] = '<b>' + key + '</b>: ' + JSON.stringify(params.entity[key]);
                        }
                    }
                    if (params.entity[key] && params.entity[key]['_dataClass']) {
                        _node['dataType'] = params.entity[key]['_dataClass'].name;
                        _node['label'] = '<b>' + key + '</b> ' + _node['dataType'] + ' (' + _node['entityType'] + ')';
                        _node['leaf'] = false;
                        _node['entity'] = params.entity[key];
                    }

                    switch (typeof params.entity[key]) {
                        case 'string':
                            _node['label'] = '<b>' + key + '</b>: ' + params.entity[key];
                            break;
                        case 'number':
                            _node['label'] = '<b>' + key + '</b>: ' + params.entity[key];
                            break;
                        case 'boolean':
                            /**
                             * in case of attribute of type "bool" and value == false
                             * the "entityType" (comes from "__proto__.constructor") is empty
                             */
                            if (!_node['entityType']) {
                                _node['entityType'] = 'Boolean';
                            }
                            _node['label'] = '<b>' + key + '</b>: ' + params.entity[key];
                            break;

                    }
                }
                return _node;
            }
        ).filter(
            f => f !== undefined && f['entityType'] && f['entityType'] !== 'Function'
        );
        node['children'] = nodeChildren;
        return node;
    }

}
