from get_transcript import get_transcript_video
import multiprocessing

vids = ['/Users/msandov/Desktop/Capstone/test_data/taxi_driver_004-0.mov', '/Users/msandov/Desktop/Capstone/test_data/taxi_driver_004-0.mov']

pool = multiprocessing.Pool(multiprocessing.cpu_count())
for i in pool.imap_unordered(get_transcript_video, vids):
    print(i)
pool.close()