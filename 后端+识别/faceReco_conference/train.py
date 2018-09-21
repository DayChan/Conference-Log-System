import numpy as np
import tensorflow as tf
from DataSet import DataSet



train_able = True

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
    output = tf.placeholder("float", [None, 1])
    optimazer = tf.train.AdamOptimizer()
    loss = tf.losses.sigmoid_cross_entropy(output, results)
    train_op = optimazer.minimize(loss)
else:
    data = DataSet(data_path="Data/images_evaluation/*")
saver = tf.train.Saver()

with tf.Session() as sess:
    sess.run(tf.global_variables_initializer())
    ckpt = tf.train.get_checkpoint_state("models/")
    if ckpt and ckpt.model_checkpoint_path:
        saver.restore(sess, ckpt.model_checkpoint_path)
        print("restore")
    if train_able:
        for i in range(5000):
            img_left, img_right, label = data.next_train_batch(50)
            feed_dict = {left_input:img_left, right_input:img_right, output:label}
            sess.run(train_op,feed_dict)
            if i % 100 == 0:
                re = sess.run(out, feed_dict)
                re[re >= 0.5] = 1
                re[re < 0.5] = 0
                print(np.mean(np.equal(re, label)))
                saver.save(sess, "models/model", global_step=i)
                # print(sess.run([out, loss], feed_dict), label)
    else:
        for i in range(1000):
            img_left, img_right, label = data.next_train_batch(50)
            feed_dict = {left_input:img_left, right_input:img_right, output:label}
            re = sess.run(out, feed_dict)
            re[re >= 0.5] = 1
            re[re < 0.5] = 0
            print(np.mean(np.equal(re, label)))







