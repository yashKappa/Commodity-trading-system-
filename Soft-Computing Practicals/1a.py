x=float(input("Enter value of x:"))
w=float(input("Enter value of weight w:"))
b=float(input("Enter value of bias b:"))
net = int(w*x+b)
if(net<0):
    out=0
elif((net>=0)&(net<=1)):
    out =net
else:
    out=1
print("net=",net)
print("output=",out)
