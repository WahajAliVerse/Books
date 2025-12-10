# rclpy Bridges: Connecting Python with ROS 2

One of the key advantages of ROS 2 is its multi-language support, allowing developers to write nodes in different programming languages and seamlessly communicate between them. rclpy is the Python client library for ROS 2, providing a bridge between Python applications and the ROS 2 ecosystem.

## Introduction to rclpy

rclpy provides a Python API for ROS 2 that allows Python developers to create publishers, subscribers, services, and actions. It abstracts the lower-level details of the ROS 2 communication layer, making it accessible to Python developers while maintaining the powerful features of ROS 2.

## Basic Node Structure

```python
import rclpy
from rclpy.node import Node

class MinimalPublisher(Node):

    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = 'Hello World: %d' % self.i
        self.publisher_.publish(msg)
        self.get_logger().info('Publishing: "%s"' % msg.data)
        self.i += 1

def main(args=None):
    rclpy.init(args=args)

    minimal_publisher = MinimalPublisher()

    rclpy.spin(minimal_publisher)

    # Destroy the node explicitly
    minimal_publisher.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Safety Implementation

When using rclpy in humanoid robotics applications, safety considerations are paramount:

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Bool
from geometry_msgs.msg import Twist

class SafeRobotController(Node):

    def __init__(self):
        super().__init__('safe_robot_controller')
        
        # Publisher for movement commands
        self.cmd_vel_publisher = self.create_publisher(Twist, '/cmd_vel', 10)
        
        # Subscriber for emergency stop
        self.emergency_stop_subscriber = self.create_subscription(
            Bool,
            '/emergency_stop',
            self.emergency_stop_callback,
            10
        )
        
        # Initialize safety state
        self.is_safe_to_move = True
        self.safety_timeout = self.create_timer(0.1, self.safety_check)
        
        self.get_logger().info('Safe Robot Controller initialized')

    def emergency_stop_callback(self, msg):
        if msg.data:
            self.is_safe_to_move = False
            self.get_logger().warn('EMERGENCY STOP ACTIVATED')
        else:
            self.is_safe_to_move = True
            self.get_logger().info('Emergency stop deactivated')

    def safety_check(self):
        # Implement regular safety checks
        if not self.is_safe_to_move:
            # Send stop command to prevent movement
            stop_cmd = Twist()
            self.cmd_vel_publisher.publish(stop_cmd)

    def safe_move(self, linear_x=0.0, angular_z=0.0):
        if self.is_safe_to_move:
            cmd = Twist()
            cmd.linear.x = linear_x
            cmd.angular.z = angular_z
            self.cmd_vel_publisher.publish(cmd)
        else:
            self.get_logger().warn('Movement blocked by safety system')
```

## Integration with Humanoid Systems

In humanoid robotics, rclpy bridges are essential for connecting various subsystems:

1. **Sensor Integration**: Reading data from multiple sensors using rclpy
2. **Actuator Control**: Sending commands to various joints and motors
3. **Behavior Coordination**: Managing complex behaviors through ROS 2 actions
4. **Simulation Integration**: Connecting with simulation environments

## Advanced Patterns

For humanoid robotics applications, certain patterns emerge when using rclpy:

- **State Machines**: Implementing complex robot behaviors
- **Parameter Management**: Dynamically adjusting robot parameters
- **Multi-Threaded Nodes**: Handling multiple tasks within a single node
- **Lifecycle Nodes**: Managing initialization, activation, and deactivation

These patterns ensure that the robotic nervous system remains reliable, robust, and safe while enabling the complex behaviors required for humanoid robotics.