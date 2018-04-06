# Readable Beta v1.0

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
* Doc-Ready (We might not use it)
* Chart.js



Build your project with ``./gradlew build``


## Compatibility

| Version       | XP version |
| ------------- | ---------- |
| 1.4.0	        | 6.12.0 - |
| 1.3.0	        | 6.12.0 - |
| 1.2.0	        | 6.7.0 - 6.11.x |
| 1.1.0         | 6.7.0 - 6.11.x |
| 1.0.0         | 6.4.0 - 6.11.x |


## Building and deploying
    ./gradlew clean build
    ./gradlew deploy
