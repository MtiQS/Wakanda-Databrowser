import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Http, Headers, Request, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Wakanda } from '../wakanda.service';

interface IDataClasses {
    allDataClasses: Array<any>;
}

const dataClasses: IDataClasses = {
    allDataClasses: []
};

interface IDataClass {
    name: string;
    filter: any;
}

const dataClass: IDataClass = {
    name: '',
    filter: {
        type: '',
        className: '',
        filterString: ''
    }
};

interface IDataStoreURL {
    url: string;
}

const dataStoreURL: IDataStoreURL = {
    url: ''
};

interface IPathCombination {
    path: string;
}

const pathCombination: IPathCombination = {
    path: ''
};

const dataClassesStore = new BehaviorSubject<IDataClasses>(dataClasses);
const dataClassStore = new BehaviorSubject<IDataClass>(dataClass);
const dataStoreURLStore = new BehaviorSubject<IDataStoreURL>(dataStoreURL);
const pathCombinationStore = new BehaviorSubject<IPathCombination>(pathCombination);

@Injectable()

export class ApiService {

    dataClassesStore = dataClassesStore;
    dataClassesStoreChanges = dataClassesStore
        .asObservable()
        .distinctUntilChanged()
        .do(dataClassesStoreChanges => console.log('new dataClasses', dataClassesStoreChanges));

    dataClassStore = dataClassStore;
    dataClassStoreChanges = dataClassStore
        .asObservable()
        .distinctUntilChanged()
        .do(dataClassStoreChanges => console.log('new dataClass', dataClassStoreChanges));

    dataStoreURLStore = dataStoreURLStore;
    dataStoreURLStoreChanges = dataStoreURLStore
        .asObservable()
        .distinctUntilChanged()
        .do(dataStoreURLStoreChanges => console.log('new dataStoreURL', dataStoreURLStoreChanges));

    pathCombinationStore = pathCombinationStore;
    pathCombinationStoreChanges = pathCombinationStore
        .asObservable()
        .distinctUntilChanged()
        .do(pathCombinationStoreChanges => console.log('new pathCombination', pathCombinationStoreChanges));

    constructor() {

    }

    setDataClasses(theDataClasses: IDataClasses) {
        this.dataClassesStore.next(theDataClasses);
    }

    setDataClass(aName: IDataClass) {
        this.dataClassStore.next(aName);
    }

    setDataStoreURL(params) {
        this.dataStoreURLStore.next(params['dataStoreURL']);
    }

    setFilter(aFilter: IDataClass) {
        this.dataClassStore.next(aFilter);
    }

    addPath(aPathFragment: string) {
        const currPath = this.pathCombinationStore.value;
        currPath.path += ((currPath.path.length === 0) ? '' : '.') + aPathFragment;

        const newPath: IPathCombination = {
            path: ''
        };
        newPath.path = currPath.path;
        this.pathCombinationStore.next(newPath);
    }

    clearPath() {
        const newPath: IPathCombination = {
            path: ''
        };
        this.pathCombinationStore.next(newPath);
    }
}
