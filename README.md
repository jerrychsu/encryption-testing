Pre-QA Checklist: 
============
Testing will not begin until this is completed by the PM & Engineer

Ticket setup and information:
---------
All required details and information are included in this ticket in accordance with the Product QA Process

QA Environment:
--------
1. git clone this repo.
1. serve local html using `python -m SimpleHTTPServer` from this directory
1. browse to test pages located at yourlocaldomain.com:8000/test-files/
    * use hosts file to have a test domain point to localhost

example:
```
127.0.0.1 josh.com
127.0.0.1 josh1.com
127.0.0.1 josh2.com
127.0.0.1 josh3.com
127.0.0.1 josh4.com
127.0.0.1 josh5.com
127.0.0.1 josh6.com
127.0.0.1 josh7.com
127.0.0.1 josh8.com
127.0.0.1 josh9.com
127.0.0.1 josh10.com
127.0.0.1 josh11.com
127.0.0.1 josh12.com
```

html files:
* These files include a "stag" version of c.js and id-service that will return encoded IDs
   * test-bx-apikey.html
   * test-othercustomer.html
   * test-othercustomer2.html
   * test-twoclients.html
   * test-bx-and-nonbx.html
   * test-allclients.html
* This is the prod version of client-js id-service
   * test-prodclient-nonbx.html
* These will mix and match production c.js, stag id-service and vice versa
   * test-oldcjs-stag-id-service
   * test-newjs-prod-id-service
* ID Pixel
  * test-idpixel-bx.html
  * test-idpixel-othercustomer.html
  * test-idpixel-othercustomer2.html

Basic core application functionality in the QA Environment:
-----------
Load the html page in a browser, w/ cache cleared or previously cached depending on the test


Task Description
-------------
Currently all bxID customers are returned the same IDs. we would like to return a different, cryptographically secure encoded ID to each client. In our logs and functionally in our backend, our ID will remain the same.

* As a note, we will not be encoding IDs if we are loaded by bouncex.

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

Further encryption description:

https://bouncex.atlassian.net/wiki/spaces/EN/pages/294223875/Identity+Encryption


Acceptance Criteria / Feature Expectations
====================
The core functionalities this feature needs to perform to meet the requirements of all stakeholders.


ON STAG ID-SERVICE / CLIENT-JS
-----------------------

* Encoded ID checks

- [ ] I expect that if a script is loaded with a non-bx apikey, the IDs returned to the callback will be encoded in base64 format
- [ ] I expect that if a script is loaded with a bx apikey, the IDs returned to the callback will _not_ be encoded, and will be in KSUID format
- [ ] I expect that if on a page with multiple scripts w/ different apikeys, we will do 2 calls to the id-service, and the encodedIDs will be different for those two clients
    * test-twoclients.html
    * test-allclients.html
- [ ] I expect from pageview to pageview and domain to domain the encodedIDs will remain the same for a given client

* MasterID checks

- [ ] I expect that c.js will send masterIDs to partner-pixel, user-service, and event tracker
- [ ] I expect that c.js will send masterIDs to id-service in the query parameters
    - [ ] I expect that the matches.firstPartyCookie boolean is true in stackdriver in id-service stackdriver logs for that request
- [ ] I expect that c.js will send masterIDs to id-service via the 3rd party cookie
    - [ ] I expect that the matches.thirdPartyCookie boolean is true in stackdriver in id-service stackdriver logs for that request

Backwards compatability checks
-----------------------
* c.js with prod id-service
- [ ] I expect that c.js will return plaintextIDs to the callback if hitting current production id-service
- [ ] I expect that c.js will store plaintextIDs in localStorage and sessionStorage if hitting production id-service under client specific __idcontext_$APIKEY

* old c.js with stag id-service
- [ ] I expect that old versions of c.js will return the encodedIDs to the client
- [ ] I expect that old versions of c.js will store the encoded IDs under the __idcontext value in localStorage, and __idcontextsc sessionStorage, and under __idcontext in firstPartyCookies
- [ ] I expect that after hitting stag id-service with an old version of c.js, then hitting stag id-service with a new version of c.js, it will retrieve the first party cookie value correctly and send it to the id-service, and expect id-service matches.firstPartySoftID to be true.

- [ ] I expect that after hitting prod id-service with an old version of c.js, then hitting prod id-service with a new version of c.js, it will retrieve the first party cookie value correctly and send it to the id-service, and expect id-service matches.firstPartySoftID to be true.


TODO: add pixel, reset expectations


reset expectations
------------
- [ ] I expect that after traveling to a site with the bx apikey (test-bx-apikey.html) and a non bx test site (test-othercustomer.html) and then going to the resetID page and resetting my ID, i receive IDs after subsequently traveling back to the two other pages. I also expect that in stackdriver, our `returnedIDs` are different for both after resetting.


Pixel expectations
---------
- [ ] I expect that after hitting all 3 pixel pages, id-service logs them all with the same returnedIDs, for BX the encodedIDs are the same as returnedIDs, and for othercustomer and othercustomer2 the encodedIDs are be different. (logs in stackdriver)


Scope
------

* c.js
* id-service
* via decrypted masterIDs:
    * partner-pixel
    * user-service
    * event-tracker (bxSync)


Testing Information
id-service-testing stackdriver link:

https://console.cloud.google.com/logs/viewer?project=augur-web-services&minLogLevel=0&expandAll=false&limitCustomFacetWidth=true&interval=NO_LIMIT&resource=container&logName=projects%2Faugur-web-services%2Flogs%2Fid-service-testing




Browsers:
    Google Chrome
    Safari
    Firefox

useful functions
```
// use this to decrypt what's stored in localStorage / 1st party cookie / session Storage
function decodeCache(cache) {
    return atob(decodeURIComponent(cache))
}
```



For PI to complete:
* Test plan:
* Automated tests for this feature:
