import sys
import mimetypes
import json
import os

from get_timecode import get_timecode_audio, get_timecode_video
from screenplay import Screenplay
from get_transcript import get_transcript_audio, get_transcript_video
from shot_classification import classify_shots
from media_matching import find_audio_match


abs_path = os.path.abspath(__file__)
dir_name = os.path.dirname(abs_path)
os.chdir(dir_name + '/..')

scp = Screenplay('../test_liene/screenplay.fdx')

with open('structure.json', 'r') as f:
    structure = json.load(f)

audio_files = []
video_files = []
for file in structure.keys():
    if structure[file]['real_path'][-4:].lower() == '.mts':
        video_files.append(file)
    
    else:
        try:
            type_of_file = mimetypes.MimeTypes().guess_type(structure[file]['real_path'])[0][:5]
        except TypeError:
            continue
        
        if type_of_file == 'audio':
            audio_files.append(file)
        elif type_of_file == 'video':
            video_files.append(file)

'''
for audio_file in audio_files:
    structure[audio_file]['ltc_timecode'] = get_timecode_audio(structure[audio_file]['real_path'], '25', '6')
    structure[audio_file]['transcript'] = get_transcript_audio(structure[audio_file]['real_path'])
    structure[audio_file]['scene'] = scp.find_scene_from_transcript(structure[audio_file]['transcript'])

    print(audio_file, ' done.')
'''

possible_audio_matches = {}
for audio_file in audio_files:
    possible_audio_matches[audio_file] = structure[audio_file]

for video_file in video_files:
    # structure[video_file]['ltc_timecode'] = get_timecode_video(structure[video_file]['real_path'], '25', '6')
    # structure[video_file]['type_of_shot'] = classify_shots(structure[video_file]['real_path'])
    structure[video_file]['transcript'] = get_transcript_video(structure[video_file]['real_path'])
    structure[video_file]['scene'] = scp.find_scene_from_transcript(structure[video_file]['transcript'])
    structure[video_file]['corresponding_audio'] = ''

    if structure[video_file]['scene'] == -1:
        matches = find_audio_match(structure[video_file]['ltc_timecode'], possible_audio_matches)
        if len(matches) != 0:
            structure[video_file]['scene'] = structure[matches[0]]['scene']
            structure[video_file]['corresponding_audio'] = matches[0]

    print(video_file, 'done.')

with open('structure.json', 'w') as f:
    json.dump(structure, f, indent=4)
