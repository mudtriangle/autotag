import sys
import mimetypes
import json
import os
from datetime import datetime

import contextlib

from tqdm import tqdm
# from p_tqdm import p_umap

from get_timecode import get_timecode_audio, get_timecode_video
from get_transcript import get_transcript_audio, get_transcript_video
from shot_classification import classify_shots
from screenplay import Screenplay
from media_matching import find_audio_match


def converter(o):
    if isinstance(o, datetime):
        return o.__str__()


class DummyFile(object):
    file = None
    def __init__(self, file):
        self.file = file

    def write(self, x):
        # Avoid print() second call (useless \n)
        if len(x.rstrip()) > 0:
            tqdm.write(x, file=self.file)


@contextlib.contextmanager
def nostdout():
    save_stdout = sys.stdout
    sys.stdout = DummyFile(sys.stdout)
    yield
    sys.stdout = save_stdout


def main(structure_dict, key):
    with nostdout():
        result_dict = structure_dict['media'][key]

        if structure_dict['media'][key]['real_path'] == "":
            return [key, result_dict, "Not a file"]

        type_of_file = mimetypes.MimeTypes().guess_type(result_dict['real_path'])[0][:5]

        if type_of_file == 'audio':
            result_dict['is_media'] = True

            if 'get_ltc' in structure['settings']['options_str'] and 'ltc_timecode' not in list(result_dict.keys()):
                result_dict['ltc_timecode'] =\
                    get_timecode_audio(result_dict['real_path'], '25', '6')

            if 'get_transcript' in structure['settings']['options_str'] and 'transcript' not in list(result_dict.keys()):
                result_dict['transcript'] =\
                    get_transcript_audio(result_dict['real_path'], structure_dict['settings']['languages'])

            if 'get_scenes' in structure['settings']['options_str'] and 'scene' not in list(result_dict.keys()):
                result_dict['scene'] =\
                    str(scp.find_scene_from_transcript(result_dict['transcript']))

        elif type_of_file == 'video':
            result_dict['is_media'] = True

            if 'get_ltc' in structure['settings']['options_str'] and 'ltc_timecode' not in list(result_dict.keys()):
                result_dict['ltc_timecode'] =\
                    get_timecode_video(result_dict['real_path'], '25', '6')

            if 'get_transcript' in structure['settings']['options_str'] and 'transcript' not in list(result_dict.keys()):
                result_dict['transcript'] =\
                    get_transcript_video(result_dict['real_path'], structure_dict['settings']['languages'])

            if 'get_scenes' in structure['settings']['options_str'] and 'scene' not in list(result_dict.keys()):
                result_dict['scene'] =\
                    str(scp.find_scene_from_transcript(result_dict['transcript']))

            if 'get_shot' in structure['settings']['options_str'] and 'type_of_shot' not in list(result_dict.keys()):
                result_dict['type_of_shot'] =\
                    classify_shots(result_dict['real_path'])

        else:
            result_dict['is_media'] = False

    return [key, result_dict, type_of_file]


with open(sys.argv[1], 'r') as f:
    structure = json.load(f)

if len(structure['settings']['path_to_screenplay']) > 0:
    scp = Screenplay(structure['settings']['path_to_screenplay'])
    structure['settings']['num_scenes'] = len(scp.scenes)

audio_keys = []
video_keys = []

res = []
for key in tqdm(list(structure['media'].keys())):
    if len(structure['media'][key]['real_path']) > 0:
        res.append(main(structure, key))

for item in res:
    structure['media'][item[0]] = item[1]
    if item[2] == 'audio':
        audio_keys.append(item[0])
    elif item[2] == 'video':
        video_keys.append(item[0])

if 'get_scenes' in structure['settings']['options_str']:
    with nostdout():
        audio_dict = {}
        for audio_key in audio_keys:
            audio_dict[audio_key] = structure['media'][audio_key]

        for video_key in video_keys:
            if structure['media'][video_key]['scene'] == '-1':
                continue

            try:
                interval = structure['media'][video_key]['ltc_timecode']
            except KeyError:
                continue

            matches = find_audio_match(interval, audio_dict)
            if len(matches) == 0:
                continue

            possible_scenes = []
            for match in matches:
                possible_scenes.append(match['scene'])
            structure['media'][video_key]['scene'] = max(set(matches), key=matches.count)

structure['settings']['last_execution'] = datetime.now()

with open(sys.argv[1], 'w') as f:
    json.dump(structure, f, indent=4, default=converter)
