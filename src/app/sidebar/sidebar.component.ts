import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Wakanda } from '../wakanda.service';
import { ApiService } from '../shared/api.service';
import { AppComponent } from '../app.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
    public dataClasses = [];
    private dataStore = {};
    public dataStoreUrl = 'http://localhost:8083';
    constructor(
        private wakanda: Wakanda,
        private apiService: ApiService,
        private core: AppComponent
    ) { }

    loadCatalog() {
        const _dataClasses = [];
        Observable.fromPromise(this.wakanda.openDataStore({ URL: this.dataStoreUrl })).subscribe(
            res => {
                Observable.from(Object.keys(res)).subscribe(
                    key => {
                        _dataClasses.push(res[key]);
                    },
                    err => {
                        this.core._setGrwolMsg({
                            severity: 'error',
                            summary: 'Generating list of data classes failed!',
                            detail: 'Error: ' + err
                        });
                    },
                    () => {
                        this.dataClasses = _dataClasses;
                        this.apiService.setDataClasses({allDataClasses: this.dataClasses});
                    });
            },
            err => {
                this.core._setGrwolMsg({
                    severity: 'error',
                    summary: 'Opening data store failed!',
                    detail: 'Error: ' + err
                });
            }
        );
    }

    loadDataClass(name) {
        this.apiService.addPath(name);
        this.apiService.setDataClass({name: name, filter: {}});
    }

}
