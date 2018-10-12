Pre-QA Checklist: 
============
Testing will not begin until this is completed by the PM & Engineer

Ticket setup and information:
---------
All required details and information are included in this ticket in accordance with the Product QA Process

QA Environment:
--------
serve local html using `python -m SimpleHTTPServer`

* use hosts file to have a test domain point to localhost

html files:
* These files include a "stag" version of c.js and id-service that will return encoded IDs
   * test-oneclient.html
      * test-twoclients.html
      * test-allclients.html
   * This is the prod version of client-js id-service
      * test-prodclient.html
   * These will mix and match production c.js, stag id-service and vice versa
      * test-oldcjs-stag-id-service
      * test-newjs-current-id-service


Basic core application functionality in the QA Environment:
-----------
Load the html page in a browser, w/ cache cleared or previously cached depending on the test


Task Description

Currently all bxID customers are returned the same IDs. we would like to return a different, cryptographically secure encoded ID to each client. In our logs and functionally in our backend, our ID will remain the same.

^ As a note, we will not be encoding IDs if we are loaded by bouncex.

Additionally, this now means that we will call to our id-service for every script that we load on the page. We should confirm that on the backend, the returnedIDs are the same.

To accomodate these changes, we have also refactored our cache storage library on the client, with the following details:

* changes localStorage and sessionStorage to be client specific.
    * This means that multiple clients loading us on a domain will create multiple of these values.

* stores masterIDs separately from EncodedIDs.
    * Until the change on ID-Service is live, the encodedIDs will be the same as plaintext IDs.
    * masterIDs will be sent to internal services (ID-service, PartnerPixel, User-Service, Prospect-Detector)
    * encodedIDs will be returned to the client's js callback.

* Adds the IDS_ONLY_CB. (IDOCB)
    * The IDOCB will return to a client supplied script parameter data-idsonlycb the IDs only, based off of the 1st party local storage. This will speed up our TTI for clients that need that.


Acceptance Criteria / Feature Expectations
The core functionalities this feature needs to perform to meet the requirements of all stakeholders.


ON STAG ID-SERVICE / CLIENT-JS
-----------------------

* Encoded ID checks

[] I expect that if a script is loaded with a non-bx apikey, the IDs returned to the callback will be encoded in base64 format
[] I expect that if a script is loaded with a bx apikey, the IDs returned to the callback will _not_ be encoded, and will be in KSUID format
[] I expect that if on a page with multiple scripts w/ different apikeys, we will do 2 calls to the id-service, and the encodedIDs will be different for those two clients
[] I expect from pageview to pageview and domain to domain the encodedIDs will remain the same for a given client

* MasterID checks

[] I expect that c.js will send masterIDs to partner-pixel, user-service, and event tracker
[] I expect that c.js will send masterIDs to id-service in the query parameters
[] I expect that c.js will send masterIDs to id-service via the 3rd party cookie


* Backwards compatability checks

* c.js with prod id-service
[] I expect that c.js will return plaintextIDs to the callback if hitting current production id-service
[] I expect that c.js will store plaintextIDs in localStorage and sessionStorage if hitting production id-service under client specific __idcontext_$APIKEY

*old c.js with new id-service
[] I expect that old versions of c.js will return the encodedIDs to the client
[] I expect that old versions of c.js will store the encoded IDs under the __idcontext value in localStorage and sessionStorage, and under __idcontextsc in firstPartyCookies


Scope
------

* c.js
* id-service
* via decrypted masterIDs:
    * partner-pixel
    * user-service
    * event-tracker (bxSync)


Testing Information
**Stackdriver Link**


Browsers:
    Google Chrome
    Safari
    Firefox


For PI to complete:
* Test plan:
* Automated tests for this feature:
