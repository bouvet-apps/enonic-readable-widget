# Readable v1.0

### Readability Scoring Widget for Enonic XP

## Description 

Analyzes text fields in an Enonic XP site, and returns a readable score.

The readable score is derived from a combination of the following metrics :
* Flesch-Kincaid 
* Coleman-Liau
* Gunning Fog Score
* Automated Readability Index
* Smog Index

Thirdparty JS Libraries :

* Text-Statistics
* Doc-Ready
* Chart.js



Build your project with ``./gradlew build``


## Compatibility

| Version       | XP version |
| ------------- | ---------- |
| 1.0.0	        | 6.12.0 - |

## Building and deploying
    ./gradlew clean build
    ./gradlew deploy
