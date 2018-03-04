/**
 * The main component that renders single TabComponent
 * instances.
 */

import { Component, ContentChildren, QueryList, AfterContentInit, ViewChild, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { TabComponent } from './tab.component';
import { DynamicTabsDirective } from './dynamic-tabs.directive';
import { ApiService } from '../shared';

@Component({
    selector: 'app-tabs',
    providers: [],
    template: `
    <ul class="nav nav-tabs">
        <li *ngFor="let tab of tabs" (click)="selectTab(tab)" [class.active]="tab.active">
            <a>{{tab.title}}</a>
        </li>
        <!-- dynamic tabs -->
        <li *ngFor="let tab of dynamicTabs" (click)="selectTab(tab)" [class.active]="tab.active">
            <a>{{tab.title}}
            <span class="tab-close" *ngIf="tab.isCloseable" (click)="closeTab(tab)">
                <i class="fa fa-times" aria-hidden="true"></i>
            </span>
            </a>
        </li>
        <!--<li class="tab-new">
            <p-button label="Click" icon="fa-check" iconPos="left" (click)="_openTab()"></p-button>
        </li>-->
    </ul>
    <ng-content></ng-content>
    <ng-template dynamic-tabs #container></ng-template>
    <ng-template let-dataClass="dataClass" #dataClass>
        <app-singledataclass></app-singledataclass>
    </ng-template>
    <ng-template let-tree="tree" #tree>
    <app-tree></app-tree>
</ng-template>
  `,
    styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements AfterContentInit {
    dynamicTabs: TabComponent[] = [];

    @ContentChildren(TabComponent)
    tabs: QueryList<TabComponent>;

    @ViewChild(DynamicTabsDirective)
    dynamicTabPlaceholder: DynamicTabsDirective;

    @ViewChild('dataClass') dataClassTemplate;
    @ViewChild('tree') treeTemplate;
    private data: any;
    private dataClassName = '';
    private openedDataClasses = {};

    /*
      Alternative approach of using an anchor directive
      would be to simply get hold of a template variable
      as follows
    */
    // @ViewChild('container', {read: ViewContainerRef}) dynamicTabPlaceholder;

    constructor(private _componentFactoryResolver: ComponentFactoryResolver, private api: ApiService) {
        // constructor(private _componentFactoryResolver: ComponentFactoryResolver) {
        this.api.dataClassStoreChanges.pluck('name').subscribe(
            name => {
                this.dataClassName = name.toString();
                this._openTab();
            });
    }

    // contentChildren are set
    ngAfterContentInit() {
        // get all active tabs
        const activeTabs = this.tabs.filter((tab) => tab.active);

        // if there is no active tab set, activate the first
        if (activeTabs.length === 0 && this.tabs.first) {
            this.selectTab(this.tabs.first);
        }

        this.openTab(this.dynamicTabs.length, 'Tree', this.treeTemplate, {}, false);
    }

    _openTab() {
        if (this.dataClassName.length > 0) {
            if (!this.openedDataClasses[this.dataClassName] || this.openedDataClasses[this.dataClassName] === false) {
                this.openTab(this.dynamicTabs.length, this.dataClassName, this.dataClassTemplate, this.dataClassName, true);
                this.openedDataClasses[this.dataClassName] = true;
            }
        }
    }

    openTab(id: number, title: string, template, data, isCloseable = false) {
        // get a component factory for our TabComponent
        const componentFactory = this._componentFactoryResolver.resolveComponentFactory(TabComponent);

        // fetch the view container reference from our anchor directive
        const viewContainerRef = this.dynamicTabPlaceholder.viewContainer;

        // alternatively...
        // let viewContainerRef = this.dynamicTabPlaceholder;

        // create a component instance
        const componentRef = viewContainerRef.createComponent(componentFactory);

        // set the according properties on our component instance
        const instance: TabComponent = componentRef.instance as TabComponent;
        instance.id = id;
        instance.title = title;
        instance.template = template;
        instance.dataContext = data;
        instance.isCloseable = isCloseable;

        // remember the dynamic component for rendering the
        // tab navigation headers
        this.dynamicTabs.push(componentRef.instance as TabComponent);

        // set it active
        this.selectTab(this.dynamicTabs[this.dynamicTabs.length - 1]);
    }

    selectTab(tab: TabComponent) {
        // deactivate all tabs
        if (this.tabs) {
            this.tabs.toArray().forEach(_tab => _tab.active = false);
        }

        this.dynamicTabs.forEach(_tab => _tab.active = false);

        // activate the tab the user has clicked on.
        if (tab) {
            tab.active = true;
        }
    }

    closeTab(tab: TabComponent) {
        this.openedDataClasses[tab.title] = false;
        for (let i = 0; i < this.dynamicTabs.length; i++) {
            if (this.dynamicTabs[i] === tab) {
                // remove the tab from our array
                this.dynamicTabs.splice(i, 1);

                // destroy our dynamically created component again
                const viewContainerRef = this.dynamicTabPlaceholder.viewContainer;
                // let viewContainerRef = this.dynamicTabPlaceholder;
                viewContainerRef.remove(i);

                // set tab index to 1st one
                this.selectTab(this.tabs.first);
                break;
            }
        }
    }

    closeActiveTab() {
        const activeTabs = this.dynamicTabs.filter((tab) => tab.active);
        if (activeTabs.length > 0) {
            // close the 1st active tab (should only be one at a time)
            this.closeTab(activeTabs[0]);
        }
    }

}
