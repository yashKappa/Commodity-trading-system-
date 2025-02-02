import numpy as np
import decimal
import math
np.set_printoptions(precision=2)

v1 = np.array([0.6, 0.3])
v2 = np.array([-0.1, 0.4])
w = np.array([-0.2, 0.4, 0.1])
b1 = 0.3
b2 = 0.5
x1 = 0
x2 = 1
alpha = 0.25

print("calculate net input to z1 layer")
zin1 = round(b1 + x1 * v1[0] + x2 * v2[0], 4)
print("z1=", round(zin1, 3))

print("calculate net input to z2 layer")
zin2 = round(b2 + x1 * v1[1] + x2 * v2[1], 4)
print("z2=", round(zin2, 4))

print("Apply activation function to calculate output")
z1 = 1 / (1 + math.exp(-zin1))
z1 = round(z1, 4)
z2 = 1 / (1 + math.exp(-zin2))
z2 = round(z2, 4)

print("z1=", z1)
print("z2=", z2)

print("calculate net input to output layer")
yin = w[0] + z1 * w[1] + z2 * w[2]
print("yin=", yin)

print("calculate net output")
y = 1 / (1 + math.exp(-yin))
print("y=", y)

fyin = y * (1 - y)
dk = (1 - y) * fyin
print("dk", dk)

dw1 = alpha * dk * z1
dw2 = alpha * dk * z2
dw0 = alpha * dk
print("compute error portion in delta")

din1 = dk * w[1]
din2 = dk * w[2]
print("din1=", din1)
print("din2=", din2)

print("error in delta")
fzin1 = z1 * (1 - z1)
print("fzin1", fzin1)
d1 = din1 * fzin1
fzin2 = z2 * (1 - z2)
print("fzin2", fzin2)
d2 = din2 * fzin2

print("d1=", d1)
print("d2=", d2)

print("Changes in weights between input and hidden layer")
dv11 = alpha * d1 * x1
print("dv11=", dv11)
dv21 = alpha * d1 * x2
print("dv21=", dv21)
dv01 = alpha * d1
print("dv01=", dv01)

dv12 = alpha * d2 * x1
print("dv12=", dv12)
dv22 = alpha * d2 * x2
print("dv22=", dv22)
dv02 = alpha * d2
print("dv02=", dv02)

print("Final weights of network")
v1[0] = v1[0] + dv11
v1[1] = v1[1] + dv12
print("v=", v1)
v2[0] = v2[0] + dv21
v2[1] = v2[1] + dv22
print("v2", v2)

w[1] = w[1] + dw1
w[2] = w[2] + dw2
b1 = b1 + dv01
b2 = b2 + dv02
w[0] = w[0] + dw0

print("w=", w)
print("bias b1=", b1, " b2=", b2)

