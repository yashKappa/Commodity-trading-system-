import math
a0=-1
t=-1
w10=float(input("Enter weight first network : "))
b10=float(input("Enter base first network : "))
w20=float(input("Enter weight second network : "))
b20=float(input("Enter base second network : "))
c=float(input("Enter learning coefficient : "))
n1=float(w10*c+b10)
a1=math.tanh(n1)
n2=float(w20*a1+b20)
a2=math.tanh(float(n2))
e=t-a2
s2=-2*(1-a2*a2)*e
s1=(1-a1*a1)*w20*s2
w21=w20-(c*s2*a1)
w11=w10-(c*s1*a0)
b21=b20-(c*s2)
b11=b10-(c*s1)
print("The updated weight of first n/w w11 = ",w11)
print("The uploaded weight of second n/w w21 = ",w21)
print("The updated base of first n/w b10 = ",b10)
print("The updated base of second n/w b20 = ",b20)
