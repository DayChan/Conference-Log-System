import numpy as np
import tensorflow as tf
from DataSet import DataSet
# import argparse
import sys
import os
from PIL import Image



# parser = argparse.ArgumentParser(description='FRCNN Detector')

# parser.add_argument('--input', type=str, metavar='<path>',
                    # help='Path to image file or to a directory containing image in jpg format', required=True)

# args = parser.parse_args()

# input_path = args.input
input_path = sys.argv[1]
# img = Image.open(input_path)

# print('input_path: ' + input_path)
# print('img.format: ' + img.format)
# print('img.size: ')
# print(img.size)

train_able = False

left_input = tf.placeholder("float", [None, 480, 360, 1])
right_input = tf.placeholder("float", [None, 480, 360, 1])

def conv_layer(inputs):
    x = tf.layers.conv2d(inputs, 32, 3, 2, "same", activation=tf.nn.relu, name="conv1", reuse=tf.AUTO_REUSE)
    x = tf.layers.conv2d(x, 64, 3, 2, "same", activation=tf.nn.relu, name="conv2", reuse=tf.AUTO_REUSE)
    x = tf.layers.conv2d(x, 128, 3, 2, "same", activation=tf.nn.relu, name="conv3", reuse=tf.AUTO_REUSE)
    x = tf.layers.conv2d(x, 256, 3, 2, "same", activation=tf.nn.relu, name="conv4", reuse=tf.AUTO_REUSE)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.layers.dense(x, 128, activation=tf.nn.relu, name="dense1", reuse=tf.AUTO_REUSE)
    x = tf.layers.dense(x, 128, activation=tf.nn.relu, name="dense2", reuse=tf.AUTO_REUSE)
    return x


left_features = conv_layer(left_input)
right_features = conv_layer(right_input)

distance = tf.abs(left_features - right_features)

results = tf.layers.dense(distance, 1)


out = tf.nn.sigmoid(results)


if train_able:
    data = DataSet(data_path="Data/images_background/*")
else:
    data = DataSet(data_path="./faceReco_conference/Data/images_evaluation/*")
saver = tf.train.Saver()

with tf.Session() as sess:
    sess.run(tf.global_variables_initializer())
    ckpt = tf.train.get_checkpoint_state("models/")
    if ckpt and ckpt.model_checkpoint_path:
        saver.restore(sess, ckpt.model_checkpoint_path)
        # print("restore")
    img_left, img_right, names = data.next_reco_batch(input_path)
    # print(img_left.shape, img_right.shape)
    feed_dict = {left_input:img_left, right_input:img_right}
    re = sess.run(out, feed_dict)
    #print(re)
    if max(re) < 0.5:
        #os.write(3, bytes('{"dt" : "This is a test"}\n', 'utf8'))
        print("Err!")
    else:
        #os.write(3, bytes('{"dt" : "This is a 2 test"}\n', 'utf8'))
        print(names[np.argmax(re)])
        #print(['zouziruo'])
        
        # re[re >= 0.5] = 1
        # re[re < 0.5] = 0
        # print(np.mean(np.equal(re, names)))







