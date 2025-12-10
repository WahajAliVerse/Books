# Bipedal Navigation with Nav2

Navigation in humanoid robots, particularly bipedal systems, presents unique challenges compared to wheeled robots. This section covers the implementation of Navigation 2 (Nav2) specifically adapted for bipedal humanoid robots, addressing the unique kinematic and safety requirements of legged locomotion.

## Introduction to Bipedal Navigation

Bipedal navigation differs from traditional wheeled navigation in several key ways:

- Dynamic stability requirements during locomotion
- Complex footstep planning for stable walking
- Higher computational requirements for gait control
- Different obstacle avoidance strategies (step over vs go around)
- Extended planning horizons to account for gait dynamics

## Nav2 Configuration for Bipedal Robots

### Basic Nav2 Setup

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from nav2_msgs.action import NavigateToPose
from geometry_msgs.msg import PoseStamped, Twist
from std_msgs.msg import Bool
from sensor_msgs.msg import LaserScan, PointCloud2
import math

class BipedalNav2(Node):
    def __init__(self):
        super().__init__('bipedal_nav2')
        
        # Create action client for navigation
        self.nav_to_pose_client = ActionClient(
            self,
            NavigateToPose,
            'navigate_to_pose'
        )
        
        # Publishers and subscribers
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.emergency_stop_pub = self.create_publisher(Bool, '/emergency_stop', 10)
        self.scan_sub = self.create_subscription(
            LaserScan,
            '/scan',
            self.scan_callback,
            10
        )
        
        # Bipedal-specific parameters
        self.max_step_size = 0.3  # Maximum distance between steps
        self.foot_separation = 0.2  # Distance between feet at rest
        self.com_height = 0.8  # Center of mass height
        self.step_height = 0.05  # Height to lift foot during stepping
        
        # Initialize safety systems
        self.is_safe_to_navigate = True
        self.current_gait = 'standing'
        
        self.get_logger().info('Bipedal Nav2 system initialized')

    def navigate_to_pose(self, x, y, theta):
        """Navigate to a specified pose with bipedal constraints"""
        # Create goal pose message
        goal_msg = NavigateToPose.Goal()
        goal_msg.pose.header.frame_id = 'map'
        goal_msg.pose.header.stamp = self.get_clock().now().to_msg()
        goal_msg.pose.pose.position.x = float(x)
        goal_msg.pose.pose.position.y = float(y)
        goal_msg.pose.pose.position.z = 0.0  # Assume flat terrain for now
        
        # Convert theta (yaw) to quaternion
        goal_msg.pose.pose.orientation.z = math.sin(theta / 2.0)
        goal_msg.pose.pose.orientation.w = math.cos(theta / 2.0)
        
        # Before sending the goal, check if navigation is safe for biped
        if not self.is_safe_bipedal_navigation():
            self.get_logger().error('Bipedal navigation unsafe, aborting')
            return False
        
        # Wait for action server
        if not self.nav_to_pose_client.wait_for_server(timeout_sec=5.0):
            self.get_logger().error('Navigation action server not available')
            return False
        
        # Send goal with safety callback
        self._send_goal_future = self.nav_to_pose_client.send_goal_async(
            goal_msg,
            feedback_callback=self.nav_feedback_callback
        )
        
        self._send_goal_future.add_done_callback(self.nav_result_callback)
        return True

    def is_safe_bipedal_navigation(self):
        """Check if navigation is safe for bipedal robot"""
        # Check that center of mass parameters are stable
        if self.com_height < 0.5:  # Minimum safe CoM height
            return False
            
        # Check that robot is in stable state
        if self.current_gait not in ['standing', 'walking', 'ready_to_walk']:
            return False
            
        return self.is_safe_to_navigate
```

### Footstep Planning

```python
#!/usr/bin/env python3
import numpy as np
from geometry_msgs.msg import Point
from visualization_msgs.msg import Marker, MarkerArray

class FootstepPlanner:
    def __init__(self, node):
        self.node = node
        self.foot_separation = 0.2  # Distance between feet
        self.max_step_length = 0.3
        self.max_step_width = 0.3
        self.step_height = 0.05
        
    def plan_footsteps(self, start_pose, goal_pose, step_size=0.2):
        """Plan a sequence of footsteps from start to goal"""
        # Extract positions
        start_pos = np.array([start_pose.position.x, start_pose.position.y])
        goal_pos = np.array([goal_pose.position.x, goal_pose.position.y])
        
        # Calculate the path vector
        path_vec = goal_pos - start_pos
        path_length = np.linalg.norm(path_vec)
        path_direction = path_vec / path_length if path_length > 0 else np.array([0, 0])
        
        # Calculate orientation (yaw)
        start_yaw = self.quaternion_to_yaw(start_pose.orientation)
        goal_yaw = self.quaternion_to_yaw(goal_pose.orientation)
        
        # Generate footsteps along the path
        footsteps = []
        num_steps = int(path_length / step_size)
        
        for i in range(num_steps + 1):
            # Calculate intermediate position
            progress = i / max(num_steps, 1)
            inter_pos = start_pos + progress * path_vec
            
            # Add slight offset for alternating feet
            # Use a perpendicular vector to path direction for foot offset
            perp_dir = np.array([-path_direction[1], path_direction[0]])
            foot_offset = perp_dir * (self.foot_separation / 2) * ((i % 2) * 2 - 1)
            
            left_foot_pos = inter_pos + foot_offset
            right_foot_pos = inter_pos - foot_offset
            
            footsteps.append({
                'step_number': i,
                'left_foot': Point(x=left_foot_pos[0], y=left_foot_pos[1], z=self.step_height),
                'right_foot': Point(x=right_foot_pos[0], y=right_foot_pos[1], z=self.step_height),
                'yaw': start_yaw + progress * (goal_yaw - start_yaw)
            })
        
        return footsteps
    
    def quaternion_to_yaw(self, quaternion):
        """Convert quaternion to yaw angle"""
        siny_cosp = 2 * (quaternion.w * quaternion.z + quaternion.x * quaternion.y)
        cosy_cosp = 1 - 2 * (quaternion.y * quaternion.y + quaternion.z * quaternion.z)
        return np.arctan2(siny_cosp, cosy_cosp)

    def visualize_footsteps(self, footsteps):
        """Create visualization markers for footsteps"""
        marker_array = MarkerArray()
        
        for step in footsteps:
            # Left foot marker
            left_marker = Marker()
            left_marker.header.frame_id = "map"
            left_marker.header.stamp = self.node.get_clock().now().to_msg()
            left_marker.ns = "footsteps"
            left_marker.id = step['step_number'] * 2
            left_marker.type = Marker.CYLINDER
            left_marker.action = Marker.ADD
            left_marker.pose.position = step['left_foot']
            left_marker.pose.orientation.w = 1.0
            left_marker.scale.x = 0.1  # Diameter
            left_marker.scale.y = 0.1
            left_marker.scale.z = 0.01  # Height
            left_marker.color.r = 1.0
            left_marker.color.g = 0.0
            left_marker.color.b = 0.0
            left_marker.color.a = 0.8
            marker_array.markers.append(left_marker)
            
            # Right foot marker
            right_marker = Marker()
            right_marker.header.frame_id = "map"
            right_marker.header.stamp = self.node.get_clock().now().to_msg()
            right_marker.ns = "footsteps"
            right_marker.id = step['step_number'] * 2 + 1
            right_marker.type = Marker.CYLINDER
            right_marker.action = Marker.ADD
            right_marker.pose.position = step['right_foot']
            right_marker.pose.orientation.w = 1.0
            right_marker.scale.x = 0.1  # Diameter
            right_marker.scale.y = 0.1
            right_marker.scale.z = 0.01  # Height
            right_marker.color.r = 0.0
            right_marker.color.g = 0.0
            right_marker.color.b = 1.0
            right_marker.color.a = 0.8
            marker_array.markers.append(right_marker)
        
        return marker_array
```

### Gait Control Implementation

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32MultiArray
from sensor_msgs.msg import JointState
from geometry_msgs.msg import Twist

class GaitController(Node):
    def __init__(self):
        super().__init__('gait_controller')
        
        # Publishers for joint commands
        self.joint_cmd_pub = self.create_publisher(Float32MultiArray, '/joint_commands', 10)
        self.joint_state_sub = self.create_subscription(
            JointState,
            '/joint_states',
            self.joint_state_callback,
            10
        )
        
        # Movement commands
        self.cmd_vel_sub = self.create_subscription(
            Twist,
            '/cmd_vel',
            self.cmd_vel_callback,
            10
        )
        
        # Current joint states
        self.joint_positions = {}
        self.joint_velocities = {}
        
        # Gait parameters
        self.step_frequency = 1.0  # Steps per second
        self.step_length = 0.2  # Forward distance per step
        self.step_height = 0.05  # Height to lift foot
        self.torso_height = 0.8  # Height of torso
        self.foot_separation = 0.2  # Distance between feet
        
        # Gait state
        self.swing_phase = 0.0  # 0.0 to 1.0
        self.current_gait = 'standing'
        
        # Timer for gait control loop
        self.gait_timer = self.create_timer(0.01, self.gait_control_loop)
        
        self.get_logger().info('Gait Controller initialized')

    def joint_state_callback(self, msg):
        """Update current joint states"""
        for i, name in enumerate(msg.name):
            if i < len(msg.position):
                self.joint_positions[name] = msg.position[i]
            if i < len(msg.velocity):
                self.joint_velocities[name] = msg.velocity[i]

    def cmd_vel_callback(self, msg):
        """Handle incoming velocity commands"""
        linear_x = msg.linear.x
        angular_z = msg.angular.z
        
        if abs(linear_x) > 0.01 or abs(angular_z) > 0.01:
            self.current_gait = 'walking'
        else:
            self.current_gait = 'standing'

    def gait_control_loop(self):
        """Main gait control loop"""
        if self.current_gait == 'walking':
            # Update swing phase
            self.swing_phase += 0.01 * self.step_frequency * 2 * math.pi
            if self.swing_phase >= 2 * math.pi:
                self.swing_phase = 0.0
            
            # Generate walking pattern based on current phase
            joint_commands = self.generate_walking_pattern()
            
            # Publish joint commands
            cmd_msg = Float32MultiArray()
            cmd_msg.data = joint_commands
            self.joint_cmd_pub.publish(cmd_msg)
        elif self.current_gait == 'standing':
            # Maintain standing position
            joint_commands = self.generate_standing_pattern()
            
            cmd_msg = Float32MultiArray()
            cmd_msg.data = joint_commands
            self.joint_cmd_pub.publish(cmd_msg)

    def generate_walking_pattern(self):
        """Generate joint commands for walking gait"""
        # Simplified walking pattern based on phase
        # In reality, this would be much more complex with proper inverse kinematics
        
        # Calculate swing leg and stance leg positions
        swing_phase = (self.swing_phase % (2 * math.pi)) / (2 * math.pi)
        
        # Calculate foot trajectory for swing leg
        # Simple pendulum model for foot trajectory
        foot_x_offset = self.step_length / 2 * math.sin(swing_phase * 2 * math.pi)
        foot_z_offset = self.step_height * math.sin(swing_phase * math.pi)  # Only positive in swing phase
        
        # This is a simplified version - real implementation would use
        # inverse kinematics to calculate joint angles
        joint_commands = [0.0] * 10  # Placeholder for 10 joints
        
        # In a real implementation, this would calculate proper
        # joint angles for the walking gait based on the desired
        # foot positions and body dynamics
        
        return joint_commands

    def generate_standing_pattern(self):
        """Generate joint commands to maintain standing position"""
        # Return joint angles for standing posture
        # This would be the neutral position where robot is balanced
        return [0.0] * 10  # Placeholder
```

### Safety Integration with Navigation

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan, PointCloud2
from std_msgs.msg import Bool
from geometry_msgs.msg import Twist
import numpy as np

class BipedalNavigationSafety(Node):
    def __init__(self):
        super().__init__('bipedal_navigation_safety')
        
        # Subscribe to sensor data
        self.scan_sub = self.create_subscription(
            LaserScan,
            '/scan',
            self.scan_callback,
            10
        )
        
        self.imu_sub = self.create_subscription(
            # In real implementation, this would be proper IMU msg type
            # For now using placeholder
        )
        
        # Publishers for safety controls
        self.emergency_stop_pub = self.create_publisher(Bool, '/emergency_stop', 10)
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel_safety', 10)
        
        # Safety parameters
        self.safety_distance = 0.5  # meters
        self.max_angular_velocity = 0.5  # rad/s
        self.balance_threshold = 0.2  # radians for tilt
        
        # Navigation state
        self.is_safe_to_move = True
        self.obstacle_detected = False
        
        # Timer for safety monitoring
        self.safety_timer = self.create_timer(0.1, self.safety_monitor)
        
        self.get_logger().info('Bipedal Navigation Safety System initialized')

    def scan_callback(self, msg):
        """Process laser scan data for obstacle detection"""
        # Convert scan data to distances
        ranges = np.array(msg.ranges)
        
        # Filter out invalid measurements
        valid_ranges = ranges[np.isfinite(ranges)]
        
        if len(valid_ranges) == 0:
            self.get_logger().warn('No valid scan measurements')
            return
            
        # Find minimum distance
        min_distance = np.min(valid_ranges)
        
        # Check if obstacle is too close
        self.obstacle_detected = min_distance < self.safety_distance
        
        if self.obstacle_detected:
            self.get_logger().warn(f'Obstacle detected at {min_distance:.2f}m')

    def safety_monitor(self):
        """Monitor safety conditions and take action if needed"""
        # Check obstacle condition
        if self.obstacle_detected:
            self.initiate_safety_stop()
            return
            
        # Additional balance/tilt checks would go here
        
        # If safe, ensure movement is enabled
        if not self.obstacle_detected and not self.is_safe_to_move:
            self.is_safe_to_move = True
            self.get_logger().info('Safety systems indicate robot is clear to move')

    def initiate_safety_stop(self):
        """Initiate safety stop procedures"""
        if self.is_safe_to_move:
            self.is_safe_to_move = False
            
            # Send emergency stop command
            stop_msg = Bool()
            stop_msg.data = True
            self.emergency_stop_pub.publish(stop_msg)
            
            # Send zero velocity command
            stop_cmd = Twist()
            self.cmd_vel_pub.publish(stop_cmd)
            
            self.get_logger().error('EMERGENCY STOP: Safety conditions not met')

    def is_navigation_safe(self, goal_pose):
        """Check if navigation to goal pose is safe"""
        # Check path for obstacles
        # In real implementation, this would do path planning and validation
        path_clear = True  # Simplified check
        
        # Check if goal is within operational limits
        # This would include checking the planned path for safety
        goal_reachable = True  # Simplified check
        
        return path_clear and goal_reachable
```

## Performance Optimization

For efficient bipedal navigation, consider these optimization techniques:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import Int32

class NavigationPerformanceOptimizer(Node):
    def __init__(self):
        super().__init__('nav_performance_optimizer')
        
        # Publisher for performance metrics
        self.performance_pub = self.create_publisher(Int32, '/nav_performance', 10)
        
        # Performance parameters
        self.planning_effort = 5  # 1-10 scale
        self.control_frequency = 50  # Hz
        self.min_compute_load = 0.3  # Minimum CPU allocation
        self.max_compute_load = 0.8  # Maximum CPU allocation
        
        # Timer for performance monitoring
        self.performance_timer = self.create_timer(1.0, self.performance_callback)
        
        self.get_logger().info('Navigation Performance Optimizer initialized')

    def performance_callback(self):
        """Monitor and adjust navigation performance"""
        # This would monitor actual performance metrics
        # and adjust parameters like planning effort, frequency, etc.
        
        # Example: adjust planning effort based on compute availability
        current_cpu_load = self.get_cpu_load()  # Placeholder function
        if current_cpu_load > self.max_compute_load:
            # Reduce planning effort to preserve performance
            self.planning_effort = max(1, self.planning_effort - 1)
            self.get_logger().info(f'Reduced planning effort to {self.planning_effort}')
        elif current_cpu_load < self.min_compute_load and self.planning_effort < 10:
            # Increase planning effort if compute is available
            self.planning_effort += 1
            self.get_logger().info(f'Increased planning effort to {self.planning_effort}')
        
        # Publish performance metric
        perf_msg = Int32()
        perf_msg.data = self.planning_effort
        self.performance_pub.publish(perf_msg)

    def get_cpu_load(self):
        """Get current CPU load (placeholder)"""
        # In real implementation, this would check actual CPU usage
        return 0.5  # Placeholder value
```

Bipedal navigation with Nav2 requires careful consideration of the robot's dynamic nature and stability requirements. Proper gait control, footstep planning, and safety integration are essential for safe and effective navigation in humanoid robots. The system must continuously monitor stability and obstacle conditions to ensure safe operation in human environments.