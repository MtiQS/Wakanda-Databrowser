# Wakanda Data Browser (WDB)

WDB is a tool similar to PHP-MyAdmin for MySQL databases that allows you to view, create, modify or delete individual records (entities) from data classes in a Wakanda database.
Since the newer Wakanda versions no longer contain a database browser and the old database browser, based on the "walib"framework, can no longer be used without further ado, I will give the Wakanda community a new database browser.

## Prerequisites
WDB is an Angular-5 based app. A Nodejs installation is required for this, so that the necessary runtime environment is available and the required commands (npm) can be executed.

## Init and first run

* Clone or download the repository to your local computer 
* Go to the download directory (here the "src"-directory and the "package json"-file and other files should exist)
* Open the command line tool from here
* Enter the first command "npm install", now all necessary node modules will be downloaded and saved in the folder "node_modules" (this may take some time)
* after downloading all node modules start the app with the command "npm start"

## URL an port
The URL and port where the app is running is set to 127.0.0.1:8200 by default. This setting can be found in the ".angular-cli.json" file in the "defaults" section near the end of the file. You can adjust this setting according to your personal needs.

## Settings in Wakanda
The WDB runs outside the Wakanda web server and requires a permission for cross domain requests (CORS) to communicate with the Wakanda database. In Wakanda Studio, open the settings file (settings. waSettings) and locate the Publishing Information section. Activate the option "Enable Cross Origin Resource Sharing". Add the URL and port of the WDB to the list of doamins allowed for CORS, in our case:

Insert "127.0.0.1:8200" in the first input field and the methods "Post, Get, Put, Delete" in the second input field, then press the "Add"button.

## Usage of WDB
Open the WDB app in your browser under the URL http://127.0.0.1:8200 or as it is stored locally in the file ".angular-cli.json".

At the top left-hand side is an input field, where you enter the URL of the Wakanda instance whose database you want to access, e. g. http:// localhost: 8083. Use the "Load" button to connect to the database and, if all settings are correct, you will see under the input field all data classes of the database that are in public view.

The display and work area is located on the right side of the app. By default, the "Tree" tab is displayed here. If you click a data class in the list of data classes on the left-hand side, a new tab will be added and opened on the right-hand side. All entities in this data class are displayed here. Click on a row and the record is selected, it can now be edited. The functionality is similar to the old data browser (walib version).

The "Tree" tab provides a different view of the data. First select a data class from the dropdown list and enter a valid primary key of a data record in the input field. With the button next to the input field you start the search for exactly this data record (therefore the primary key). If the record was found, it is displayed as the root node. From this root node, you can now navigate deeper into your data by opening the next node (if available) by clicking the plus (+) icon.
