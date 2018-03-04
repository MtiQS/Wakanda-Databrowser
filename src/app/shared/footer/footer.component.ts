import { Component } from '@angular/core';
import { ApiService } from '../../shared/api.service';

declare var $:any;

@Component({
    selector: 'footer-cmp',
    templateUrl: 'footer.component.html',
    styleUrls: ['./footer.component.css']
})

export class FooterComponent {
    public path: string;
    constructor(
        private apiService: ApiService
    ) {
        this.apiService.pathCombinationStoreChanges.pluck('path').subscribe(
            path => {
                this.path = path.toString();
            }
        );
    }

    _clearPath() {
        this.apiService.clearPath();
    }
}
