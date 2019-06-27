
/*
 * Throttle Controller
 * by Tyson Moll
 * 
 * References:
 * Ultrasonic Tutorial by Rui Santos, https://randomnerdtutorials.com
 * C&C18 JSON Input Demo by Nick Puckett and Kate Hartman
 * C&C18 Orientation Sensor Demo by Nick Puckett and Kate Hartman
 * 
 *  * For Arduino Micro
 * O Sensor       Arduino
 * SDA*            D2            
 * SCL*            D3
 */
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BNO055.h>
#include <utility/imumaths.h>
#include <ArduinoJson.h>

// Orientation
Adafruit_BNO055 orientationSensor = Adafruit_BNO055();  //create a orienation sensor object
unsigned long lastRead;   //used for the sampleRate timer
int sampleRate = 100;     //the sampleRate for reading the sensor.  Without this it will crash.
float xOrientation;     //holds the X orientation    Degrees
float yOrientation;     //holds the Y orientation    Degrees
float zOrientation;      //holds the Z orientation   Degrees

// Ultrasonic
int trigPin = 5;    // Ultrasonic Trigger 
int echoPin = 6;    // Ultrasonic Echo
long duration, cm; // Units for Ultrasonic
unsigned long lastSend, sonicCount;
int sendRate = 50;
int sonicRate = sendRate;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT); // Ultrasonic
  pinMode(echoPin, INPUT);

  if(!orientationSensor.begin()) //connect to the sensor and print an error if there is a problem
    {
    Serial.println("Can't connect to the Sensor. Check the Wiring");
    while(1);
    }
  
  delay(1000);  ///wait for one second for everything to start up.
    
  orientationSensor.setExtCrystalUse(true);
}

void loop() 

{

  // Orientation
  if(millis()-lastRead>=sampleRate) {
    sensors_event_t event; //create an event variable
    orientationSensor.getEvent(&event); //pass it to the BNO055 object
  
    //get the values
    xOrientation = event.orientation.x;
    yOrientation = event.orientation.y;
    zOrientation = event.orientation.z;

    /*
    //print the data
    Serial.print("X: ");
    Serial.print(xOrientation);
    Serial.print("  Y:  ");
    Serial.print(yOrientation);
    Serial.print("  Z:  ");
    Serial.println(zOrientation);
  */
    
    lastRead = millis(); //save the value of the current time so the timer works
  }

  // Ultrasonic
  if (millis() - sonicCount >= sonicRate) {
    digitalWrite(trigPin, LOW); // LOW clearing ensures clean HIGH pulse
    delayMicroseconds(5); // 0.000005 seconds
    digitalWrite(trigPin, HIGH); // Triggers ultrasonic signal
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);
   
    // Read the signal from the sensor: a HIGH pulse whose
    // duration is the time (in microseconds) from the sending
    // of the ping to the reception of its echo off of an object.
    pinMode(echoPin, INPUT);
    duration = pulseIn(echoPin, HIGH);
   
    // Convert the time into a distance
    cm = (duration/2) / 29.1;     // Divide by 29.1 or multiply by 0.0343

    /*
    Serial.print(cm); // Report unit distance
    Serial.print("cm");
    Serial.println();
    */
    
    sonicCount = millis(); // Refresh
  }

  // use a timer to stablize the data send
  if (millis() - lastSend >= sendRate) {
      //send the values to P5 over serial
      DynamicJsonBuffer messageBuffer(200);                   //create the Buffer for the JSON object        
      JsonObject& p5Send = messageBuffer.createObject();      //create a JsonObject variable in that buffer       

      //assigns variable values to json object keys
      p5Send["s1"]=cm;  
      p5Send["s2"]=xOrientation; 
      p5Send["s3"]=yOrientation;
      p5Send["s4"]=zOrientation;
      p5Send.printTo(Serial);    //print JSON object as a string
      Serial.println();          //print a \n character to the serial port to distinguish between objects
    
      lastSend = millis(); // Refresh
  }  
}
