import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {WakandaClient} from 'wakanda-client/browser/no-promise';

export class Wakanda {
  private _client: WakandaClient;
  private _catalog;
  private _hostName: string;
  private location: Location;

  constructor() {
    this._hostName = location.hostname;
    // this._client = new WakandaClient({ host: 'http://' + this._hostName + ':8083'});
    this._catalog = null;
  }

  openDataStore(params) {
    this._client = new WakandaClient({ host: params.URL});

    return Promise.resolve(this.catalog);
  }

  get catalog() {
    if (!this._catalog) {
      return this._client.getCatalog().then(c => {
        this._catalog = c;
        return c;
      });
    }
    return Promise.resolve(this._catalog);
  }

  get hostName() {
    return Promise.resolve(this._hostName);
}
}
