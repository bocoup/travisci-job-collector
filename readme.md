# TravisCI Job Collector

An application designed to retrieve statistics for "jobs" run in the
[TravisCI](https://travis-ci.org) continuous integration environment.

## Instructions

**Prerequisites**

- [Node.js](https://nodejs.org/) version 6 or greater.
- *optional* Node.js module dependencies, installed by issuing the following
  command from the root of this project: `npm install`. This will enable HTTP
  response caching. This reduces the time required to execute the program when
  input does not change, and it helps avoid reaching API request rate limits.

**Usage**

The program may be executed by issuing the following command from the root of
this project: `node .`. The program will prompt for GitHub.com access
credentials; these are necessary to request large amounts of data from the
GitHub.com API. The results of the data gathering process will be printed to
the process's standard output stream in CSV format.

## License

Copyright (c) 2017 Google, Inc.  
Licensed under the MIT license.
