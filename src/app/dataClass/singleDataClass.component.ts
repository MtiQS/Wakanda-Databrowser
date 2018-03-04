import { Component, NgModule, Inject, Injectable, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { LocationStrategy, PlatformLocation, Location } from '@angular/common';
import { Wakanda } from '../wakanda.service';
import { ApiService } from '../shared/api.service';
import { AppComponent } from '../app.component';
import { Table } from 'primeng/components/table/table';
import { SelectItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Injectable()
class InputClass {
    public className: string;
    public filterString: string;
    public type: string;

    constructor() {
        this.className = undefined;
        this.filterString = undefined;
        this.type = undefined;
    }
}

@Component({
    selector: 'app-singledataclass',
    templateUrl: './SingleDataClass.component.html',
    styleUrls: ['./SingleDataClass.component.css']
})
export class SingleDataClassComponent {
    public input: InputClass;

    public dataClass;
    public data: any;
    public loading = false;
    public entities: any[];
    public cols: SelectItem[];
    public selectedColumns: any[];
    public totalRecords = 0;
    public pageSizes;
    public selectedPageSize: number;
    public selectedEntity;

    @ViewChild('dt') datatable: Table;

    constructor(
        private wakanda: Wakanda,
        private apiService: ApiService,
        private core: AppComponent,
        private confirmationService: ConfirmationService
    ) {
        this.pageSizes = [
            { label: '5', value: 5 },
            { label: '10', value: 10 },
            { label: '20', value: 20 }
        ];
        this.selectedPageSize = 10;
        this.input = new InputClass();
        this.apiService.dataClassStoreChanges.pluck('name').subscribe(
            name => {
                if (this.input.className === undefined) {
                    this.input.className = name.toString();
                }
            }
        );

        this.apiService.dataClassStoreChanges.pluck('filter').subscribe(
            filter => {
                if (filter && this.input && this.input.className !== undefined && this.input.className === filter['className']) {
                    this.input.filterString = filter['filterString'];
                    if (filter['type'] === 'find') {
                        this.input.type = 'find';
                        this._findData({});
                    } else {
                        this.input.type = 'search';
                        this._searchData({});
                    }
                }
                if (filter && this.input && this.input.className === undefined) {
                    this.input.className = filter['className'];
                    this.input.filterString = filter['filterString'];
                }
            }
        );
    }

    _loadDataClass(params) {
        if (this.input.className !== '') {
            Observable.fromPromise(this.wakanda.catalog).subscribe(
                catalog => {
                    this.dataClass = catalog[this.input.className];
                },
                err => {
                    this.core._setGrwolMsg({
                        severity: 'error',
                        summary: 'Failed to load dataclass',
                        detail: 'Error message: ' + err + '!'
                    });
                },
                () => {
                    this.cols = this.dataClass.attributes.map(
                        a => {
                            return {
                                label: a.name,
                                value: {
                                    type: (a.entityType) ? a.entityType : a.type,
                                    kind: a.kind,
                                    field: a.name,
                                    header: a.name,
                                    isKey: false
                                }
                            };
                        }
                    );
                    this.selectedColumns = this.cols;
                    if (this.input.type === 'find') {
                        this._findData(params);
                    } else {
                        this._searchData(params);
                    }
                }
            );
        }
    }

    _searchData(params) {
        if (this.dataClass) {
            this.loading = true;
            Observable.fromPromise(this.dataClass.query(
                {
                    filter: this.input.filterString,
                    start: parseInt(params.first, 10),
                    pageSize: parseInt(params.rows, 10),
                }
            )).subscribe(
                data => {
                    this.data = data;
                    this.entities = data['entities'];
                    this.totalRecords = data['_count'];
                    if (this.entities && this.entities.length > 0) {
                        const kbv = function getKeyByValue(object, value) {
                            const keys = Object.keys(object);
                            keys.splice(keys.indexOf('_key'), 1);
                            keys.splice(keys.indexOf('_stamp'), 1);
                            return keys.find(key => {
                                // tslint:disable-next-line:triple-equals
                                return object[key] == value;
                            }
                            );
                        };
                        const _key = kbv(this.entities[0], this.entities[0]._key);
                        try {
                            this.cols.find(
                                a => a.value.field === _key
                            ).value.isKey = true;
                        } catch (e) {
                            this.core._setGrwolMsg({
                                severity: 'error',
                                summary: 'No primary key field available!',
                                detail: 'Please provide a public field which is primary key\nError: ' + e
                            });
                        }

                    }
                    this.loading = false;
                },
                err => {
                    this.core._setGrwolMsg({
                        severity: 'error',
                        summary: 'Searching data failed',
                        detail: 'Error: ' + err
                    });
                });
        }
    }

    _findData(params) {
        if (this.dataClass) {
            Observable.fromPromise(this.dataClass.find(this.input.filterString)).subscribe(
                entity => {
                    const kbv = function getKeyByValue(object, value) {
                        const keys = Object.keys(object);
                        keys.splice(keys.indexOf('_key'), 1);
                        keys.splice(keys.indexOf('_stamp'), 1);
                        return keys.find(key => {
                            // tslint:disable-next-line:triple-equals
                            return object[key] == value;
                        }
                        );
                    };
                    this.entities = [];
                    this.entities.push(entity);
                    if (this.input.type === 'find') {
                        const key = this.input.filterString;
                        this.input.filterString = kbv(entity, this.input.filterString) + ' = ' + key;
                    }
                    this.input.type = undefined;
                },
                err => {
                    this.core._setGrwolMsg({
                        severity: 'error',
                        summary: 'Finding data failed',
                        detail: 'Error: ' + err
                    });
                }
            );
        } else {
            this._loadDataClass(params);
        }
    }

    loadRelatedEntity(params) {
        this.apiService.addPath(params.relatedClassName);
        this.apiService.setDataClass({ name: params.relatedClassName, filter: { type: 'find', className: params.relatedClassName, filterString: params.key } });
    }

    loadRelatedEntityCollection(params) {

        /**
         * Identify the name of the field which contains the primary key
         */
        const kbv = function getKeyByValue(object, value) {
            const keys = Object.keys(object);
            keys.splice(keys.indexOf('_key'), 1);
            keys.splice(keys.indexOf('_stamp'), 1);
            return keys.find(key => {
                // tslint:disable-next-line:triple-equals
                return object[key] == value;
            }
            );
        };
        /**
         * Identify the corresponding name of the field that references this class as the type
         */
        let dataClassToOpen = {};
        let relatedAttributeName = '';
        Observable.fromPromise(this.wakanda.catalog).subscribe(
            catalog => {
                dataClassToOpen = catalog[params.related.value.type];
            },
            err => {
                this.core._setGrwolMsg({
                    severity: 'error',
                    summary: 'Finding field name failed!',
                    detail: 'Error: ' + err
                });
            },
            () => {
                relatedAttributeName = dataClassToOpen['attributes'].find(
                    a => a.type === this.input.className
                ).name;
                let filterString = relatedAttributeName + '.';
                filterString += kbv(params.rowData, params.rowData._key) + ' == ' + params.rowData._key;
                this.apiService.addPath(params.related.value.field + '.query(\'' + filterString + '\')');
                this.apiService.setDataClass({ name: params.related.value.type, filter: { type: 'search', className: params.related.value.type, filterString: filterString } });
            }
        );
    }

    loadDataLazy(params) {
        if (!this.dataClass) {
            this._loadDataClass(params);
        } else {
            if (this.input.type === 'find') {
                this._findData(params);
            } else {
                this._searchData(params);
            }
        }
    }

    _saveEntity(params) {
        try {
            if (this.selectedEntity && this.selectedEntity._key) {
                Observable.fromPromise(this.selectedEntity.save()).subscribe(
                    res => {
                        this.core._setGrwolMsg({
                            severity: 'success',
                            summary: 'Save data',
                            detail: 'Data saved successful!'
                        });
                        /**
                         * Workaround to switch back in view mode
                         * there is no function like "switchCellToViewMode" as in the deprecated datatable component
                         */
                    },
                    err => {
                        this.core._setGrwolMsg({
                            severity: 'error',
                            summary: 'Save data',
                            detail: 'Could not save data!'
                        });
                    }
                );
            } else {
                this.core._setGrwolMsg({
                    severity: 'error',
                    summary: 'Save data',
                    detail: 'No entity selected!'
                });
            }
        } catch (err) {
            this.core._setGrwolMsg({
                severity: 'error',
                summary: 'Transaction failed',
                detail: 'Error message: ' + err + '!'
            });
        }
    }

    _deleteEntity() {
        try {
            if (this.selectedEntity && this.selectedEntity._key) {

                this.confirmationService.confirm({
                    message: 'Are you sure that you want to delete this entity?',
                    accept: () => {
                        Observable.fromPromise(this.selectedEntity.delete()).subscribe(
                            res => {
                                this.entities = this.entities.filter(
                                    e => e._key !== this.selectedEntity._key
                                );
                                this.core._setGrwolMsg({
                                    severity: 'success',
                                    summary: 'Remove data',
                                    detail: 'Data removed successfully!'
                                });
                            },
                            err => {
                                this.core._setGrwolMsg({
                                    severity: 'error',
                                    summary: 'Remove data',
                                    detail: 'Could not remove data!'
                                });
                            }
                        );
                    }
                });
            } else {
                this.core._setGrwolMsg({
                    severity: 'error',
                    summary: 'Remove data',
                    detail: 'No entity selected!'
                });
            }
        } catch (err) {
            this.core._setGrwolMsg({
                severity: 'error',
                summary: 'Transaction failed',
                detail: 'Error message: ' + err + '!'
            });
        }
    }

    _add() {
        if (this.dataClass) {
            const tmpEntity = this.dataClass.create();
            let entity = {};
            if (tmpEntity) {
                Observable.fromPromise(tmpEntity.save()).subscribe(
                    res => {
                        entity = res;
                    },
                    err => {
                        this.core._setGrwolMsg({
                            severity: 'error',
                            summary: 'Add new entity',
                            detail: 'Could not create new entity: ' + err + '!'
                        });
                    },
                    () => {
                        this.entities.push(entity);
                    }
                );
            }
        }
    }

    downloadBLOB(params) {
        try {
            if (params && params.rowData && params.rowData._key) {
                this.selectedEntity = params.rowData;
                window.open(params.rowData[params.BLOBfield].uri, '_blank');
            }
        } catch (err) {
            this.core._setGrwolMsg({
                severity: 'error',
                summary: 'BLOB download failed',
                detail: 'Error message: ' + err + '!'
            });
        }
    }

    onFocus(params) {
        if (params && params.rowData) {
            this.selectedEntity = params.rowData;
        }
    }

}
