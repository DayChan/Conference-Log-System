from PIL import Image
import sys

def main(dir):
    im = Image.open(dir).convert('L')
    fname=dir.split('/')[-1][0:-4]
    out = im.resize((360,480),Image.ANTIALIAS) #resize image with high-quality
    out.save('./image/'+fname+'.tif')
    print("converte success!")

main(sys.argv[1])


