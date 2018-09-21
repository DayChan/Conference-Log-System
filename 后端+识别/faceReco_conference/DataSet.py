from glob import glob
from matplotlib import pyplot as plt
import numpy as np


class DataSet:
    def __init__(self, data_path = "Data/images_background/*"):
        self.class_path = glob(data_path)
        # print()
        self.img_path = {}
        self.img_name = {}
        self.count = 0
        for path in self.class_path:
            self.img_path[path] = glob(path+"/*.tif")
            # print(self.img_path)
            temp = path.split("/")
            # print(temp)
            # print(temp[1])
            self.img_name[path] = temp[-1]
            self.count += self.img_path[path].__len__()
        # print(self.img_path)

    def next_train_batch(self, batchsize):
        img_left = []
        img_right = []
        label = []
        for i in range(batchsize):
            if np.random.rand() > 0.5:
                left, right = np.random.randint(0, len(self.class_path), 2)
            else:
                right = np.random.randint(0, len(self.class_path), 1)[0]
                left = right
            if left == right:
                label.append(1)
            else:
                label.append(0)
            # print(self.class_path[left])
            # print(self.img_path)
            left_path = np.random.choice(self.img_path[self.class_path[left]], 1)
            right_path = np.random.choice(self.img_path[self.class_path[right]], 1)
            # print(left_path, right_path)
            img_left.append(plt.imread(left_path[0]))
            img_right.append(plt.imread(right_path[0]))

        return np.expand_dims(np.asarray(img_left), -1), np.expand_dims(np.asarray(img_right), -1)\
            , np.expand_dims(np.asarray(label), -1)

    def next_reco_batch(self, input_path):
        img_left = []
        img_right = []
        reco_name = []
        for i in range(len(self.class_path)):
            left_path = input_path
            right_path = self.img_path[self.class_path[i]]
            reco_name.append(self.img_name[self.class_path[i]])
            # print(left_path)
            # print(right_path[0])
            img_left.append(plt.imread(left_path))
            #print(right_path)
            img_right.append(plt.imread(right_path[0]))#   ß
        return np.expand_dims(np.asarray(img_left), -1), np.expand_dims(np.asarray(img_right), -1)\
            , np.expand_dims(np.asarray(reco_name), -1)


#
# print(np.random.randint(0, 3, 2))


#
# data = DataSet()
# print(data.next_train_batch(10).shape)
# for i in range(10):
#     print(data.next_train_batch(10)[2])

# print(data.count)
# # print(data.img_path)



