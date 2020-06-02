# AutoTag: Metadata Automation for Film Post-Production
Project originally developed as José Marcelo Sandoval-Castañeda's udergraduate thesis in New York University Abu Dhabi, 2020.

## Overview
Users will benefit the most from using the AutoTag toolset at the beginning of the post-production process: a day of production has finished, with its corresponding footage ready to be imported into Adobe Premiere Pro and to be transcoded (if necessary) or simply have its metadata tagged right away. First, the media is imported into a Premiere project. Then, within Adobe Premiere Pro, the AutoTag tools will execute the following steps:
1. First, the linear timecode (LTC) intervals represented in each piece of media are translated into readable timecode. This will be helpful for finding metadata through other files. For example, if the scene corresponding to a video is unclear after transcription, its corresponding audio file(s) can be used to correctly identify the scene. The conversion from sound waves to readable timecodes is performed using the LTCTools framework, which uses Fast Fourier Transforms to decode the corresponding frequencies. 
2. The second step is to generate a transcript from each piece of media is generated. This serves two purposes: (i) to match the media to the corresponding scene in the screenplay, and/or (ii) to be able to associate the text with the time markers in that piece media. For speech recognition, AutoTag uses Google Cloud Speech-to-Text API, which employs a proprietary (to Google) state-of-the-art deep learning model.
3. Lastly, all video footage is run on the shot identification model, which uses the location of faces within a shot to classify the video in up to two out of five relevant categories, close-up shot, medium close-up shot, medium shot, American shot, and long shot. Facial recognition is performed by a ResNet-based Single Shot Detector provided by Adrian Rosebrock and originally developed in Caffe. The k-means model used to identify the different types of shots in media was trained using frames from a mix of commercial feature films and independent student short films, totalling approximately one million individual frames.
4. After these are finished, the relevant metadata information is written into the Premiere project, in the form of metadata tags or media markers.

## How to Install
Installing the files should be straightforward by downloading `install.sh` from this repository. This script installs all the necessary requirements to run AutoTag, and places it in the corresponding Extensions folder for Adobe Premiere Pro. The way to execute it is to run the command:
```
sudo sh ./install.sh
```
**Note:** This plug-in currently only works in MacOS.

## Setting Up Google Cloud
To fully take advantage of AutoTag's capabilities, specifically Speech-to-Text, a Google Cloud account is required. To create an account, go to [Google Cloud's website](https://cloud.google.com). Then, activate an API key for Speech-to-Text [here](https://cloud.google.com/speech-to-text/). To set up AutoTag with your Google Cloud account, you must create a directory called `api_keys` within the AutoTag directory with a file called `google_cloud.json` with your Google Cloud credentials, or set up an environment variable called `GOOGLE_CLOUD_CREDENTIALS` with the directory where your credentials are stored in your machine.

