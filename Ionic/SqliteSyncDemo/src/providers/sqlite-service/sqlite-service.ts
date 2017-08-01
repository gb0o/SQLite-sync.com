import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { AlertController, LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/map';

declare var sqlitesync_DB;

@Injectable()
export class SqliteServiceProvider {

  public sqlitesync_tables;

  constructor(public http: Http,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController) 
  {
    console.log('Hello SqliteServiceProvider Provider');
  }

  openDatabase(){
    let name = 'sqlitesynccom_demo';
    let loading = this.loadingCtrl.create({
      content: 'Opening database. Please wait...'
    });
    loading.present();
    let sqlite_db = new SQLite();
    sqlite_db.create({ name: name, location: 'default' }).then((db: SQLiteObject) => {
      sqlitesync_DB = db;
      Promise.all([
        this.getTables()
      ]).then(val => {
        loading.dismiss();
      });
    }, (error) => {
      loading.dismiss();
      let alert = this.alertCtrl.create({
        title: 'Error',
        message: 'Error while opening database: ' + error,
        buttons: ['Close']
      });
      alert.present();
    });
  }

  getTables(){
    return new Promise((resolve,reject) => {
      if(sqlitesync_DB){
        sqlitesync_DB.executeSql("SELECT tbl_name FROM sqlite_master WHERE type='table'", {})
        .then( (data) => {
          this.sqlitesync_tables = [];
          for (let i = 0; i < data.rows.length; i++){
            if(data.rows.item(i).tbl_name !== "android_metadata")
              this.sqlitesync_tables.push(data.rows.item(i).tbl_name);
          }
          resolve();
        })
        .catch( error => {
          this.sqlitesync_tables = [];
          reject();
        });
      }
    })
  }

  getDataFromTable(tableName){
    return new Promise((resolve) => {
      if(sqlitesync_DB){
        sqlitesync_DB.executeSql("SELECT * FROM " + tableName, {})
        .then( (data) => {
          resolve(data);
        })
        .catch( error => {
          alert('Error - ' + error);
        })
      }
    });

  }

}