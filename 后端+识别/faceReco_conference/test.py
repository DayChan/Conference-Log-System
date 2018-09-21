from glob import glob
import string

data_path = "Data/images_background/*"
class_path = glob(data_path)
img_path = {}
img_name = {}
count = 0
# temp = []
for path in class_path:
    img_path[path] = glob(path+"\*")
    print(path)
    # print(isinstance(path,str))
    temp = path.split("\\")
    # print(temp)
    img_name[path] = temp[1]
    # print(img_name)
    count += img_path[path].__len__()
# print(img_path)
print(img_name)
