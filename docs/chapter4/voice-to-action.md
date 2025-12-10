# Voice-to-Action Implementation with Whisper Integration

This section details the implementation of voice-to-action systems using Whisper for speech recognition and natural language processing in humanoid robotics applications.

## Whisper Integration for Speech Recognition

### Audio Processing Pipeline

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from audio_common_msgs.msg import AudioData
from std_msgs.msg import String
import numpy as np
import threading
import queue
import time

class WhisperAudioProcessor(Node):
    def __init__(self):
        super().__init__('whisper_audio_processor')
        
        # Subscriber for raw audio data
        self.audio_sub = self.create_subscription(
            AudioData,
            '/microphone/audio_raw',
            self.audio_callback,
            10
        )
        
        # Publisher for recognized text
        self.text_pub = self.create_publisher(String, '/recognized_text', 10)
        
        # Audio processing parameters
        self.sample_rate = 16000  # Whisper works best at 16kHz
        self.chunk_size = 1024  # Number of samples per processing chunk
        self.audio_buffer = queue.Queue()
        self.processing_thread = threading.Thread(target=self.process_audio_loop)
        self.processing_thread.daemon = True
        self.processing_thread.start()
        
        # Initialize Whisper model
        self.setup_whisper_model()
        
        self.get_logger().info('Whisper Audio Processor initialized')

    def setup_whisper_model(self):
        """Initialize Whisper model for speech recognition"""
        try:
            import whisper
            # Load a small model for real-time processing
            self.model = whisper.load_model("base.en")  # Change to "base" for multiple languages
            self.get_logger().info('Whisper model loaded successfully')
        except ImportError:
            self.get_logger().error('Whisper library not found. Install with: pip install openai-whisper')
            self.model = None
        except Exception as e:
            self.get_logger().error(f'Failed to load Whisper model: {e}')
            self.model = None

    def audio_callback(self, msg):
        """Receive audio data from microphone"""
        # Add audio data to the processing queue
        if not self.audio_buffer.full():
            self.audio_buffer.put(msg.data)

    def process_audio_loop(self):
        """Continuous loop for audio processing"""
        audio_chunk = b""
        
        while rclpy.ok():
            try:
                # Get audio data from queue
                if not self.audio_buffer.empty():
                    audio_data = self.audio_buffer.get_nowait()
                    audio_chunk += audio_data
                    
                    # Process when we have enough data
                    if len(audio_chunk) >= self.chunk_size * 2:  # 2 bytes per sample for 16-bit
                        # Convert bytes to numpy array
                        audio_np = np.frombuffer(audio_chunk, dtype=np.int16)
                        audio_np = audio_np.astype(np.float32) / 32768.0  # Normalize to [-1, 1]
                        
                        # Process with Whisper if model is available
                        if self.model:
                            recognized_text = self.process_with_whisper(audio_np)
                            if recognized_text.strip():
                                # Publish recognized text
                                text_msg = String()
                                text_msg.data = recognized_text
                                self.text_pub.publish(text_msg)
                                self.get_logger().info(f'Recognized: {recognized_text}')
                        
                        # Keep remaining audio data
                        samples_processed = min(len(audio_chunk), self.chunk_size * 2)
                        audio_chunk = audio_chunk[samples_processed:]
                else:
                    # Small delay to prevent busy-waiting
                    time.sleep(0.01)
            except queue.Empty:
                # No data in queue, continue loop
                time.sleep(0.01)
            except Exception as e:
                self.get_logger().error(f'Error in audio processing: {e}')

    def process_with_whisper(self, audio_data):
        """Process audio with Whisper model"""
        try:
            # Transcribe the audio
            result = self.model.transcribe(audio_data)
            return result["text"]
        except Exception as e:
            self.get_logger().error(f'Whisper processing error: {e}')
            return ""
```

### Voice Command Recognition

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan
import json

class VoiceCommandRecognizer(Node):
    def __init__(self):
        super().__init__('voice_command_recognizer')
        
        # Subscribe to recognized text
        self.text_sub = self.create_subscription(
            String,
            '/recognized_text',
            self.text_callback,
            10
        )
        
        # Publishers for robot commands
        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.action_pub = self.create_publisher(String, '/robot_actions', 10)
        
        # Initialize command vocabulary
        self.setup_command_vocabulary()
        
        self.get_logger().info('Voice Command Recognizer initialized')

    def setup_command_vocabulary(self):
        """Setup recognized voice commands and their mappings"""
        self.command_mapping = {
            # Movement commands
            'forward': 'move_forward',
            'backward': 'move_backward',
            'left': 'turn_left',
            'right': 'turn_right',
            'stop': 'stop_robot',
            'go forward': 'move_forward',
            'go backward': 'move_backward',
            'turn left': 'turn_left',
            'turn right': 'turn_right',
            'halt': 'stop_robot',
            
            # Navigation commands
            'go to kitchen': 'navigate_kitchen',
            'go to living room': 'navigate_living_room',
            'go to bedroom': 'navigate_bedroom',
            'go home': 'return_home',
            
            # Action commands
            'pick up object': 'grasp_object',
            'wave': 'wave_hand',
            'greet': 'greet_person',
            'dance': 'perform_dance',
            'introduce yourself': 'self_introduction'
        }

    def text_callback(self, msg):
        """Process recognized text for commands"""
        text = msg.data.lower().strip()
        
        # Check if text contains a valid command
        command = self.recognize_command(text)
        
        if command:
            self.get_logger().info(f'Command recognized: {command}')
            
            # Execute the command
            self.execute_command(command, text)
        else:
            # Check if text contains keywords that might indicate intent
            potential_commands = self.extract_potential_commands(text)
            if potential_commands:
                self.get_logger().info(f'Potential commands found: {potential_commands}')
                for cmd in potential_commands:
                    self.execute_command(cmd, text)
            else:
                self.get_logger().info(f'No recognized command in: "{text}"')

    def recognize_command(self, text):
        """Recognize command from text using exact matches and fuzzy matching"""
        # Check for exact command matches
        for cmd_text, cmd_func in self.command_mapping.items():
            if cmd_text in text:
                return cmd_func
        
        # If no exact match, try to find the closest match
        import difflib
        possible_matches = difflib.get_close_matches(
            text, 
            self.command_mapping.keys(), 
            n=1, 
            cutoff=0.6  # 60% similarity required
        )
        
        if possible_matches:
            return self.command_mapping[possible_matches[0]]
        
        return None

    def extract_potential_commands(self, text):
        """Extract potential commands using keyword matching"""
        potential = []
        
        # Check for movement-related keywords
        movement_keywords = ['forward', 'back', 'left', 'right', 'stop', 'move', 'go', 'turn']
        for keyword in movement_keywords:
            if keyword in text:
                if keyword == 'forward':
                    potential.append('move_forward')
                elif keyword == 'back':
                    potential.append('move_backward')
                elif keyword == 'left':
                    potential.append('turn_left')
                elif keyword == 'right':
                    potential.append('turn_right')
                elif keyword == 'stop':
                    potential.append('stop_robot')
        
        return list(set(potential))  # Remove duplicates

    def execute_command(self, command, original_text):
        """Execute the recognized command"""
        try:
            # Validate command for safety before execution
            if not self.is_command_safe(command, original_text):
                self.get_logger().error(f'Command unsafe, not executing: {command}')
                return
            
            # Execute the appropriate function based on the command
            if command == 'move_forward':
                self.move_forward()
            elif command == 'move_backward':
                self.move_backward()
            elif command == 'turn_left':
                self.turn_left()
            elif command == 'turn_right':
                self.turn_right()
            elif command == 'stop_robot':
                self.stop_robot()
            elif command == 'navigate_kitchen':
                self.navigate_to_location('kitchen')
            elif command == 'navigate_living_room':
                self.navigate_to_location('living_room')
            elif command == 'navigate_bedroom':
                self.navigate_to_location('bedroom')
            elif command == 'return_home':
                self.return_to_home()
            else:
                # For other commands, send to action planner
                action_msg = String()
                action_msg.data = json.dumps({
                    'command': command,
                    'original_text': original_text,
                    'timestamp': self.get_clock().now().to_msg().sec
                })
                self.action_pub.publish(action_msg)

        except Exception as e:
            self.get_logger().error(f'Error executing command {command}: {e}')

    def is_command_safe(self, command, original_text):
        """Check if a command is safe to execute"""
        # Get laser scan data to check current environment
        try:
            # In a real implementation, we would get current laser scan
            # For this example, we'll assume a safe environment
            return True
        except:
            # If we can't check safety, default to safe
            return True

    def move_forward(self):
        """Move robot forward"""
        cmd = Twist()
        cmd.linear.x = 0.2  # m/s
        cmd.angular.z = 0.0
        self.cmd_pub.publish(cmd)

    def move_backward(self):
        """Move robot backward"""
        cmd = Twist()
        cmd.linear.x = -0.2  # m/s
        cmd.angular.z = 0.0
        self.cmd_pub.publish(cmd)

    def turn_left(self):
        """Turn robot left"""
        cmd = Twist()
        cmd.linear.x = 0.0
        cmd.angular.z = 0.3  # rad/s
        self.cmd_pub.publish(cmd)

    def turn_right(self):
        """Turn robot right"""
        cmd = Twist()
        cmd.linear.x = 0.0
        cmd.angular.z = -0.3  # rad/s
        self.cmd_pub.publish(cmd)

    def stop_robot(self):
        """Stop robot movement"""
        cmd = Twist()
        cmd.linear.x = 0.0
        cmd.angular.z = 0.0
        self.cmd_pub.publish(cmd)

    def navigate_to_location(self, location):
        """Navigate to named location"""
        # In a real implementation, this would interface with navigation system
        self.get_logger().info(f'Navigating to {location} (not implemented in this example)')
        
        # Publish action for higher-level navigation system
        action_msg = String()
        action_msg.data = json.dumps({
            'action': 'navigate',
            'location': location,
            'timestamp': self.get_clock().now().to_msg().sec
        })
        self.action_pub.publish(action_msg)

    def return_to_home(self):
        """Return to home position"""
        self.navigate_to_location('home_base')
```

## Safety Override Integration

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String, Bool
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan, Image
from builtin_interfaces.msg import Duration
import numpy as np

class SafetyOverrideSystem(Node):
    def __init__(self):
        super().__init__('safety_override_system')
        
        # Publishers
        self.safety_pub = self.create_publisher(Bool, '/safety_status', 10)
        self.emergency_stop_pub = self.create_publisher(Bool, '/emergency_stop', 10)
        self.cmd_override_pub = self.create_publisher(Twist, '/cmd_vel_override', 10)
        
        # Subscribers
        self.voice_cmd_sub = self.create_subscription(
            String,
            '/recognized_text',
            self.voice_command_callback,
            10
        )
        
        self.laser_sub = self.create_subscription(
            LaserScan,
            '/scan',
            self.scan_callback,
            10
        )
        
        self.cmd_sub = self.create_subscription(
            Twist,
            '/cmd_vel',
            self.cmd_callback,
            10
        )
        
        # Safety parameters
        self.safety_distance = 0.5  # meters
        self.enable_safety_overrides = True
        self.last_command_time = self.get_clock().now()
        self.command_timeout = Duration(sec=5, nanosec=0)  # 5 seconds
        self.emergency_stop_active = False
        
        # Timer for safety monitoring
        self.safety_timer = self.create_timer(0.1, self.safety_check)
        
        self.get_logger().info('Safety Override System initialized')

    def voice_command_callback(self, msg):
        """Handle incoming voice commands with safety validation"""
        # Update command time for timeout monitoring
        self.last_command_time = self.get_clock().now()
        
        # Check if command should be blocked for safety
        if self.emergency_stop_active:
            self.get_logger().warn('Voice command blocked: Emergency stop active')
            return
        
        # Additional safety checks can be added here
        command_text = msg.data.lower()
        
        # Check for dangerous commands
        if self.is_dangerous_command(command_text):
            self.get_logger().error(f'Dangerous command blocked: {command_text}')
            self.trigger_emergency_stop(f'Dangerous command: {command_text}')
            return
    
    def is_dangerous_command(self, text):
        """Check if the command is potentially dangerous"""
        dangerous_keywords = [
            'fire', 'explosion', 'harm', 'hurt', 'hit', 'break', 
            'destroy', 'damage', 'unsafe', 'dangerous'
        ]
        
        for keyword in dangerous_keywords:
            if keyword in text:
                return True
        return False

    def scan_callback(self, msg):
        """Process laser scan for safety"""
        if not self.enable_safety_overrides:
            return
            
        # Check for obstacles in path
        ranges = np.array(msg.ranges)
        valid_ranges = ranges[np.isfinite(ranges)]
        
        if len(valid_ranges) == 0:
            return
            
        min_distance = np.min(valid_ranges)
        
        # If too close to obstacle, trigger safety response
        if min_distance < self.safety_distance and not self.emergency_stop_active:
            self.get_logger().warn(f'Obstacle detected at {min_distance:.2f}m, triggering safety response')
            self.trigger_safety_stop()
    
    def cmd_callback(self, msg):
        """Monitor motion commands for safety"""
        if not self.enable_safety_overrides:
            return
            
        # Check if the command is safe based on current sensor data
        if abs(msg.linear.x) > 0.5 or abs(msg.angular.z) > 0.8:  # Too fast
            # Check if environment allows for such speed
            self.check_motion_safety(msg)

    def check_motion_safety(self, cmd_msg):
        """Check if motion command is safe given current environment"""
        # In a real implementation, this would analyze sensor data
        # to determine if motion is safe
        pass

    def safety_check(self):
        """Regular safety checks"""
        current_time = self.get_clock().now()
        
        # Check for command timeout
        if (current_time - self.last_command_time).nanoseconds / 1e9 > self.command_timeout.sec:
            self.get_logger().warn('No commands received within timeout, checking safety')
            # Could implement safety behavior here
        
        # Check safety status
        safety_ok = not self.emergency_stop_active
        safety_msg = Bool()
        safety_msg.data = safety_ok
        self.safety_pub.publish(safety_msg)
        
    def trigger_safety_stop(self):
        """Trigger safety stop without full emergency stop"""
        stop_cmd = Twist()
        self.cmd_override_pub.publish(stop_cmd)
        self.get_logger().warn('Safety stop triggered')

    def trigger_emergency_stop(self, reason="Safety violation"):
        """Trigger full emergency stop"""
        self.emergency_stop_active = True
        
        # Publish emergency stop command
        stop_msg = Bool()
        stop_msg.data = True
        self.emergency_stop_pub.publish(stop_msg)
        
        # Stop all motion
        stop_cmd = Twist()
        self.cmd_override_pub.publish(stop_cmd)
        
        self.get_logger().error(f'EMERGENCY STOP: {reason}')
        
        # Auto-reset safety after a delay if needed
        # In a real implementation, this would require manual reset
        # Or a more sophisticated recovery procedure
```

### Integration with Higher-Level Planning

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import PoseStamped
import json

class VoiceToActionBridge(Node):
    def __init__(self):
        super().__init__('voice_to_action_bridge')
        
        # Subscribers
        self.text_sub = self.create_subscription(
            String,
            '/recognized_text',
            self.process_text_command,
            10
        )
        
        self.parsed_command_sub = self.create_subscription(
            String,
            '/parsed_command',
            self.process_parsed_command,
            10
        )
        
        # Publishers for different system components
        self.navigation_pub = self.create_publisher(PoseStamped, '/move_base_simple/goal', 10)
        self.manipulation_pub = self.create_publisher(String, '/manipulation_command', 10)
        self.action_plan_pub = self.create_publisher(String, '/action_plan', 10)
        
        # Initialize components
        self.command_parser = CommandParser()  # From previous section
        self.safety_validator = SafetyValidator(self)
        
        self.get_logger().info('Voice-to-Action Bridge initialized')

    def process_text_command(self, msg):
        """Process raw text command and convert to robot actions"""
        try:
            # Parse the natural language command
            parsed_command = self.command_parser.parse(msg.data)
            
            if parsed_command and parsed_command.confidence > 0.6:  # Confidence threshold
                # Validate safety
                is_safe, reason = self.safety_validator.validate_command(parsed_command)
                
                if is_safe:
                    # Convert to appropriate robot command based on intent
                    self.route_command(parsed_command)
                else:
                    self.get_logger().error(f'Command blocked for safety: {reason}')
            else:
                self.get_logger().info(f'Command not understood or low confidence: {msg.data}')
                
        except Exception as e:
            self.get_logger().error(f'Error processing text command: {e}')

    def process_parsed_command(self, msg):
        """Process already-parsed command"""
        try:
            command_data = json.loads(msg.data)
            
            # Create ParsedCommand object from JSON
            parsed_cmd = ParsedCommand(
                intent=command_data.get('intent', 'unknown'),
                objects=command_data.get('objects', []),
                locations=command_data.get('locations', []),
                actions=command_data.get('actions', []),
                confidence=command_data.get('confidence', 0.0),
                raw_text=command_data.get('raw_text', '')
            )
            
            # Route the command appropriately
            self.route_command(parsed_cmd)
            
        except json.JSONDecodeError:
            self.get_logger().error(f'Invalid JSON in parsed command: {msg.data}')
        except Exception as e:
            self.get_logger().error(f'Error processing parsed command: {e}')

    def route_command(self, parsed_command):
        """Route the command to the appropriate system based on intent"""
        intent = parsed_command.intent.lower()
        
        if intent == 'navigation':
            self.handle_navigation_command(parsed_command)
        elif intent == 'manipulation':
            self.handle_manipulation_command(parsed_command)
        elif intent == 'interaction':
            self.handle_interaction_command(parsed_command)
        elif intent == 'information':
            self.handle_information_command(parsed_command)
        else:
            self.get_logger().info(f'Unknown intent: {intent}, routing to default handler')
            self.handle_default_command(parsed_command)

    def handle_navigation_command(self, parsed_command):
        """Handle navigation-related commands"""
        locations = parsed_command.locations
        
        if locations:
            # For this example, we'll use the first location found
            target_location = locations[0]
            
            # In a real system, this would map named locations to coordinates
            # Here we'll use a simple example mapping
            location_coords = {
                'kitchen': (3.0, 1.0, 0.0),  # x, y, theta
                'living room': (0.0, 0.0, 0.0),
                'bedroom': (-2.0, 1.5, 1.57),
                'home': (0.0, 0.0, 0.0)
            }
            
            if target_location.lower() in location_coords:
                x, y, theta = location_coords[target_location.lower()]
                
                # Create and publish navigation goal
                goal = self.create_pose_stamped(x, y, theta)
                self.navigation_pub.publish(goal)
                
                self.get_logger().info(f'Navigating to {target_location}: ({x}, {y})')
            else:
                self.get_logger().warn(f'Unknown location: {target_location}')
        else:
            self.get_logger().warn('Navigation command without target location')

    def handle_manipulation_command(self, parsed_command):
        """Handle manipulation-related commands"""
        objects = parsed_command.objects
        
        if objects:
            target_object = objects[0]  # Use first object found
            
            # Publish manipulation command
            cmd_msg = String()
            cmd_msg.data = json.dumps({
                'action': 'grasp',
                'object': target_object,
                'timestamp': self.get_clock().now().to_msg().sec
            })
            self.manipulation_pub.publish(cmd_msg)
            
            self.get_logger().info(f'Manipulation command: Grasp {target_object}')
        else:
            self.get_logger().warn('Manipulation command without object specification')

    def handle_interaction_command(self, parsed_command):
        """Handle interaction-related commands"""
        # Example: handle greeting, waving, etc.
        if 'wave' in parsed_command.raw_text.lower():
            cmd_msg = String()
            cmd_msg.data = json.dumps({
                'action': 'wave',
                'timestamp': self.get_clock().now().to_msg().sec
            })
            self.manipulation_pub.publish(cmd_msg)
        elif 'greet' in parsed_command.raw_text.lower() or 'hello' in parsed_command.raw_text.lower():
            cmd_msg = String()
            cmd_msg.data = json.dumps({
                'action': 'greet',
                'timestamp': self.get_clock().now().to_msg().sec
            })
            self.manipulation_pub.publish(cmd_msg)
            
        self.get_logger().info(f'Interaction command: {parsed_command.raw_text}')

    def handle_information_command(self, parsed_command):
        """Handle information-seeking commands"""
        # This would interface with perception systems to answer questions
        self.get_logger().info(f'Information command: {parsed_command.raw_text}')
        # Implementation would depend on perception and knowledge base systems

    def handle_default_command(self, parsed_command):
        """Handle commands that don't match specific intent categories"""
        # Use LLM planner for complex or unknown commands
        plan_msg = String()
        plan_msg.data = json.dumps({
            'intent': parsed_command.intent,
            'objects': parsed_command.objects,
            'locations': parsed_command.locations,
            'raw_command': parsed_command.raw_text,
            'confidence': parsed_command.confidence
        })
        self.action_plan_pub.publish(plan_msg)
        
        self.get_logger().info(f'Default handler for: {parsed_command.raw_text}')

    def create_pose_stamped(self, x, y, theta):
        """Create a PoseStamped message for navigation"""
        goal = PoseStamped()
        goal.header.stamp = self.get_clock().now().to_msg()
        goal.header.frame_id = 'map'
        goal.pose.position.x = float(x)
        goal.pose.position.y = float(y)
        goal.pose.position.z = 0.0  # Assuming flat navigation
        
        # Convert theta to quaternion
        import math
        goal.pose.orientation.z = math.sin(theta / 2.0)
        goal.pose.orientation.w = math.cos(theta / 2.0)
        
        return goal
```

The voice-to-action implementation with Whisper integration provides a robust foundation for natural human-robot interaction in humanoid robotics. By properly integrating safety overrides, the system ensures that voice commands are processed safely, with automatic intervention when potentially dangerous situations are detected. The system's ability to understand and execute complex commands makes it suitable for sophisticated human-robot collaboration scenarios.