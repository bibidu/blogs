## 抽象类

抽象类可被`继承` 或 `实现`.
```java
abstract class Animal{
  String name = 'animal';

  speak();

  printSelf() {
    print('i am animal');
  }
}
```

`继承`某抽象类时, 只需要实现父类的`未实现方法`
```java
class Cat extends Animal{
  @override
  speak() {
    print('...cat speak');
  }
}
```

`实现`某抽象类时, 父类被视为接口, 此时需`实现所有方法`
```java
class Dog implements Animal{
  @override
  String name;

  @override
  printSelf() {
    // TODO: implement printSelf
    return null;
  }

  @override
  speak() {
    // TODO: implement speak
    return null;
  }
}
```