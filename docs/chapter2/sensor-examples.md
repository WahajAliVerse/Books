# Sensor Examples in Digital Twins

Sensors are the eyes, ears, and sensory organs of a humanoid robot, providing crucial information about the environment and the robot's state. In digital twins, accurately simulating these sensors is essential for effective simulation-to-reality transfer and safe robot development.

## Types of Sensors in Humanoid Robotics

Humanoid robots typically incorporate multiple sensor types:

1. **Proprioceptive Sensors**: Measure internal robot state (joint angles, velocities)
2. **Exteroceptive Sensors**: Measure external environment (cameras, LiDAR, IMU)
3. **Force/Torque Sensors**: Measure interaction forces and torques

## LiDAR Simulation

LiDAR (Light Detection and Ranging) sensors are crucial for navigation and obstacle detection in humanoid robots.

### Gazebo LiDAR Configuration
```xml
<!-- Example LiDAR sensor configuration in URDF -->
<gazebo reference="laser_link">
  <sensor type="ray" name="laser_sensor">
    <pose>0 0 0 0 0 0</pose>
    <visualize>true</visualize>
    <update_rate>10</update_rate>
    <ray>
      <scan>
        <horizontal>
          <samples>720</samples>
          <resolution>1</resolution>
          <min_angle>-1.570796</min_angle>  <!-- -90 degrees -->
          <max_angle>1.570796</max_angle>   <!-- 90 degrees -->
        </horizontal>
      </scan>
      <range>
        <min>0.10</min>
        <max>30.0</max>
        <resolution>0.01</resolution>
      </range>
    </ray>
    <plugin name="laser_controller" filename="libgazebo_ros_ray_sensor.so">
      <ros>
        <namespace>/laser</namespace>
        <remapping>~/out:=scan</remapping>
      </ros>
      <output_type>sensor_msgs/LaserScan</output_type>
    </plugin>
  </sensor>
</gazebo>
```

### Processing LiDAR Data for Safety
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan
from std_msgs.msg import Bool
import numpy as np

class LiDARSafetyProcessor(Node):
    def __init__(self):
        super().__init__('lidar_safety_processor')
        
        # Subscribe to LiDAR data
        self.lidar_sub = self.create_subscription(
            LaserScan,
            '/laser/scan',
            self.lidar_callback,
            10
        )
        
        # Publisher for emergency stop
        self.emergency_stop_pub = self.create_publisher(Bool, '/emergency_stop', 10)
        
        # Safety parameters
        self.min_safe_distance = 0.5  # meters
        self.emergency_stop_active = False
        
        self.get_logger().info('LiDAR Safety Processor initialized')

    def lidar_callback(self, msg):
        # Process LiDAR data for safety
        ranges = np.array(msg.ranges)
        
        # Remove invalid measurements
        valid_ranges = ranges[np.isfinite(ranges)]
        
        if len(valid_ranges) == 0:
            self.get_logger().warn('No valid LiDAR measurements')
            return
            
        # Find minimum distance
        min_distance = np.min(valid_ranges)
        
        # Check if emergency stop is needed
        if min_distance < self.min_safe_distance and not self.emergency_stop_active:
            self.trigger_emergency_stop(min_distance)
        elif min_distance >= self.min_safe_distance and self.emergency_stop_active:
            # Safe to resume (but requires manual reset)
            self.get_logger().info(f'Area clear, minimum distance: {min_distance:.2f}m')

    def trigger_emergency_stop(self, min_distance):
        self.emergency_stop_active = True
        stop_msg = Bool()
        stop_msg.data = True
        self.emergency_stop_pub.publish(stop_msg)
        self.get_logger().error(f'EMERGENCY STOP: Obstacle at {min_distance:.2f}m')
```

## Camera Simulation

Cameras provide visual input for perception systems in humanoid robots.

### Gazebo Camera Configuration
```xml
<!-- Example RGB camera configuration -->
<gazebo reference="camera_link">
  <sensor type="camera" name="camera_sensor">
    <update_rate>30</update_rate>
    <camera name="head">
      <horizontal_fov>1.396263</horizontal_fov> <!-- 80 degrees -->
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.1</near>
        <far>300</far>
      </clip>
    </camera>
    <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
      <ros>
        <namespace>/camera</namespace>
        <remapping>image_raw:=image</remapping>
        <remapping>camera_info:=camera_info</remapping>
      </ros>
    </plugin>
  </sensor>
</gazebo>
```

### Camera Safety Processing
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2
import numpy as np

class CameraSafetyProcessor(Node):
    def __init__(self):
        super().__init__('camera_safety_processor')
        
        self.bridge = CvBridge()
        
        # Subscribe to camera data
        self.camera_sub = self.create_subscription(
            Image,
            '/camera/image',
            self.camera_callback,
            10
        )
        
        self.get_logger().info('Camera Safety Processor initialized')
        
        # Minimum human detection parameters
        self.human_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_fullbody.xml')

    def camera_callback(self, msg):
        try:
            # Convert ROS Image message to OpenCV image
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')
        except Exception as e:
            self.get_logger().error(f'Failed to convert image: {e}')
            return
            
        # Detect humans in the image
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        humans = self.human_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(humans) > 0:
            self.get_logger().info(f'Detected {len(humans)} human(s) in scene')
            # Additional safety processing can be added here
            for (x, y, w, h) in humans:
                # Draw bounding box around detected human
                cv2.rectangle(cv_image, (x, y), (x+w, y+h), (0, 255, 0), 2)