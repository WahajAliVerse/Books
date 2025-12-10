# Chapter 4: Vision-Language-Action (VLA) Systems

Vision-Language-Action (VLA) systems represent the pinnacle of human-robot interaction, enabling robots to understand natural language commands and execute complex physical tasks through vision-guided action. This chapter explores the implementation of VLA systems in humanoid robotics with emphasis on safety, transparency, and human-centered design.

## Introduction to VLA Systems

VLA systems integrate three critical capabilities:

1. **Vision**: Understanding the visual environment through cameras and sensors
2. **Language**: Processing and understanding natural language commands
3. **Action**: Executing physical tasks based on visual and linguistic inputs

For humanoid robots, VLA systems enable intuitive interaction where users can speak naturally to robots, which then understand the command, perceive the environment, and execute the appropriate physical actions.

## Architecture of VLA Systems

The VLA system architecture consists of:

```
User Speech → ASR → NLU → Task Planner → Perception → Action Selection → Execution
                ↓         ↓                           ↓                    ↓
            Text    Intent Graph                Object Detection    Robot Actions
```

## Voice-to-Action Implementation with Whisper

### Speech Recognition Component

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from audio_common_msgs.msg import AudioData
from sensor_msgs.msg import Image
import numpy as np
import openai  # Using OpenAI Whisper API or local Whisper model

class VoiceToActionNode(Node):
    def __init__(self):
        super().__init__('voice_to_action')
        
        # Publishers and subscribers
        self.speech_sub = self.create_subscription(
            AudioData,
            '/audio_input',
            self.audio_callback,
            10
        )
        
        self.command_pub = self.create_publisher(String, '/parsed_command', 10)
        self.vision_sub = self.create_subscription(
            Image,
            '/camera/image',
            self.vision_callback,
            10
        )
        
        # Initialize Whisper for speech recognition
        self.setup_speech_recognition()
        
        # Initialize NLP components
        self.command_parser = CommandParser()
        
        # Initialize safety systems
        self.safety_validator = SafetyValidator(self)
        
        self.get_logger().info('Voice-to-Action system initialized')

    def setup_speech_recognition(self):
        """Initialize speech recognition components"""
        # In a real implementation, this would load Whisper model
        # or connect to a speech recognition service
        self.get_logger().info('Speech recognition initialized')

    def audio_callback(self, msg):
        """Process incoming audio data"""
        try:
            # Convert audio data to text using Whisper
            text = self.speech_to_text(msg.data)
            
            if text:
                self.get_logger().info(f'Recognized: {text}')
                
                # Parse the command
                parsed_command = self.command_parser.parse(text)
                
                # Validate command safety
                is_safe, safety_reason = self.safety_validator.validate_command(parsed_command)
                
                if is_safe:
                    # Publish the parsed command
                    cmd_msg = String()
                    cmd_msg.data = str(parsed_command)
                    self.command_pub.publish(cmd_msg)
                    
                    self.get_logger().info(f'Safe command published: {parsed_command}')
                else:
                    self.get_logger().error(f'Unsafe command blocked: {safety_reason}')
                    
                    # Publish safety error
                    error_msg = String()
                    error_msg.data = f'SAFETY_ERROR: {safety_reason}'
                    self.command_pub.publish(error_msg)
                    
        except Exception as e:
            self.get_logger().error(f'Error processing audio: {e}')

    def speech_to_text(self, audio_data):
        """Convert audio data to text using Whisper"""
        # This is a placeholder - in a real implementation, this would
        # interface with Whisper for speech-to-text conversion
        # For example: using openai's API or a local Whisper model
        return "Move to the kitchen and bring me a cup"

    def vision_callback(self, msg):
        """Process incoming vision data for action grounding"""
        # This would process the camera image to understand the environment
        # and ground language commands to specific objects/actions
        pass
```

## Natural Language Understanding

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
import spacy  # For NLP processing
import json
from dataclasses import dataclass
from typing import List, Dict, Optional

@dataclass
class ParsedCommand:
    intent: str
    objects: List[str]
    locations: List[str]
    actions: List[str]
    confidence: float
    raw_text: str

class CommandParser(Node):
    def __init__(self):
        super().__init__('command_parser')
        
        # Load NLP model (English model for basic parsing)
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            self.get_logger().warn("spaCy model not installed, using basic parsing")
            self.nlp = None
        
        # Define common commands and intents
        self.intent_patterns = {
            'navigation': ['go to', 'move to', 'walk to', 'navigate to', 'go', 'move', 'walk', 'navigate'],
            'manipulation': ['pick up', 'grasp', 'hold', 'take', 'move', 'place', 'put', 'drop'],
            'interaction': ['greet', 'wave', 'hello', 'hi', 'say hello', 'introduce'],
            'information': ['what is', 'tell me', 'describe', 'find', 'show me']
        }
        
        self.get_logger().info('Command Parser initialized')

    def parse(self, text: str) -> Optional[ParsedCommand]:
        """Parse natural language command into structured format"""
        if not text.strip():
            return None
            
        # Use spaCy for advanced NLP if available
        if self.nlp:
            doc = self.nlp(text)
            
            # Extract intents, objects, locations, and actions
            intent = self.identify_intent(doc)
            objects = self.extract_objects(doc)
            locations = self.extract_locations(doc)
            actions = self.extract_actions(doc)
            confidence = self.calculate_confidence(doc)
        else:
            # Basic parsing without NLP model
            intent = self.basic_intent_identification(text)
            objects = self.basic_extract_objects(text)
            locations = self.basic_extract_locations(text)
            actions = [text]  # Placeholder
            confidence = 0.5  # Default confidence for basic parsing
        
        return ParsedCommand(
            intent=intent,
            objects=objects,
            locations=locations,
            actions=actions,
            confidence=confidence,
            raw_text=text
        )

    def identify_intent(self, doc) -> str:
        """Identify the intent of the command using spaCy analysis"""
        text_lower = doc.text.lower()
        
        for intent, patterns in self.intent_patterns.items():
            if any(pattern in text_lower for pattern in patterns):
                return intent
                
        return "unknown"

    def basic_intent_identification(self, text: str) -> str:
        """Basic intent identification without NLP model"""
        text_lower = text.lower()
        
        for intent, patterns in self.intent_patterns.items():
            if any(pattern in text_lower for pattern in patterns):
                return intent
                
        return "unknown"

    def extract_objects(self, doc) -> List[str]:
        """Extract objects from the command using NER"""
        objects = []
        for ent in doc.ents:
            if ent.label_ in ['OBJECT', 'PRODUCT', 'FOOD', 'FACILITY']:
                objects.append(ent.text)
        
        # Also extract noun chunks that might be objects
        for chunk in doc.noun_chunks:
            if chunk.root.pos_ in ['NOUN', 'PROPN']:
                # Avoid adding locations as objects
                if chunk.text.lower() not in ['kitchen', 'bedroom', 'living room', 'table', 'couch']:
                    objects.append(chunk.text)
        
        return list(set(objects))  # Remove duplicates

    def basic_extract_objects(self, text: str) -> List[str]:
        """Basic object extraction without NLP model"""
        # This is a simplified approach
        words = text.lower().split()
        common_objects = ['cup', 'bottle', 'book', 'phone', 'fork', 'spoon', 'plate', 'ball', 'toy']
        objects = [word for word in words if word in common_objects]
        return objects

    def extract_locations(self, doc) -> List[str]:
        """Extract locations from the command"""
        locations = []
        for ent in doc.ents:
            if ent.label_ in ['GPE', 'LOC', 'FAC']:
                locations.append(ent.text)
        
        # Look for common room names
        room_names = ['kitchen', 'bedroom', 'living room', 'dining room', 'bathroom', 'office', 'hallway']
        for token in doc:
            if token.text.lower() in room_names:
                locations.append(token.text)
        
        return list(set(locations))

    def basic_extract_locations(self, text: str) -> List[str]:
        """Basic location extraction without NLP model"""
        text_lower = text.lower()
        room_names = ['kitchen', 'bedroom', 'living room', 'dining room', 'bathroom', 'office', 'hallway']
        locations = [name for name in room_names if name in text_lower]
        return locations

    def extract_actions(self, doc) -> List[str]:
        """Extract actions from the command"""
        actions = []
        for token in doc:
            if token.pos_ == 'VERB':
                actions.append(token.lemma_)
        
        return list(set(actions))

    def calculate_confidence(self, doc) -> float:
        """Calculate confidence in the parsing result"""
        # Simple confidence calculation based on sentence structure
        has_verb = any(token.pos_ == 'VERB' for token in doc)
        has_object = any(token.pos_ == 'NOUN' or token.pos_ == 'PROPN' for token in doc)
        confidence = 0.5  # Base confidence
        
        if has_verb:
            confidence += 0.3
        if has_object:
            confidence += 0.2
            
        return min(confidence, 1.0)  # Cap at 1.0
```

## LLM-Based Cognitive Planning

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import openai  # Or other LLM interface
import json
import asyncio

class LLMBasedPlanner(Node):
    def __init__(self):
        super().__init__('llm_planner')
        
        # Subscription to parsed commands
        self.command_sub = self.create_subscription(
            String,
            '/parsed_command',
            self.command_callback,
            10
        )
        
        # Publisher for detailed action plans
        self.plan_pub = self.create_publisher(String, '/action_plan', 10)
        
        # Initialize LLM interface
        self.setup_llm_interface()
        
        self.get_logger().info('LLM-Based Planner initialized')

    def setup_llm_interface(self):
        """Setup LLM interface (OpenAI or other provider)"""
        # In a real implementation, you would initialize your LLM provider here
        # For example, with OpenAI:
        # openai.api_key = os.getenv("OPENAI_API_KEY")
        self.get_logger().info('LLM interface initialized')

    def command_callback(self, msg):
        """Process parsed command and generate action plan"""
        try:
            # Parse the incoming command message
            command_data = json.loads(msg.data)
            intent = command_data.get('intent', '')
            objects = command_data.get('objects', [])
            locations = command_data.get('locations', [])
            
            # Generate detailed action plan using LLM
            action_plan = self.generate_action_plan(intent, objects, locations)
            
            if action_plan:
                # Publish the action plan
                plan_msg = String()
                plan_msg.data = json.dumps(action_plan)
                self.plan_pub.publish(plan_msg)
                
                self.get_logger().info(f'Action plan generated: {action_plan["description"]}')
            else:
                self.get_logger().error('Failed to generate action plan')
                
        except json.JSONDecodeError:
            # Handle case where message is not JSON (e.g., safety error)
            if msg.data.startswith('SAFETY_ERROR'):
                self.get_logger().warn(f'Safety error received: {msg.data}')
            else:
                self.get_logger().error(f'Invalid JSON command: {msg.data}')

    def generate_action_plan(self, intent: str, objects: list, locations: list) -> dict:
        """Generate detailed action plan using LLM"""
        try:
            # Construct prompt for the LLM
            prompt = self.construct_planning_prompt(intent, objects, locations)
            
            # In a real implementation, this would call the LLM
            # For example, using OpenAI's API:
            # response = openai.ChatCompletion.create(
            #     model="gpt-4",
            #     messages=[{"role": "user", "content": prompt}],
            #     temperature=0.3,
            #     max_tokens=500
            # )
            # plan_text = response.choices[0].message['content']
            
            # For this example, we'll simulate the LLM response
            plan_text = self.simulate_llm_response(intent, objects, locations)
            
            # Parse the LLM response into a structured plan
            plan = self.parse_plan_response(plan_text, intent)
            
            return plan
            
        except Exception as e:
            self.get_logger().error(f'Error in LLM planning: {e}')
            return None

    def construct_planning_prompt(self, intent: str, objects: list, locations: list) -> str:
        """Construct prompt for LLM-based planning"""
        prompt = f"""
        You are a cognitive planner for a humanoid robot. Generate a detailed step-by-step action plan to execute the user's command.

        Command intent: {intent}
        Relevant objects: {', '.join(objects)}
        Target locations: {', '.join(locations)}

        Requirements:
        1. Include navigation steps if needed
        2. Include object detection and manipulation steps
        3. Include safety checks at each major step
        4. Output in JSON format with fields: description, steps, safety_checks

        Example output structure:
        {{
            "description": "Brief description of the plan",
            "steps": [
                {{"action": "description of step 1", "type": "navigation|manipulation|other"}},
                {{"action": "description of step 2", "type": "navigation|manipulation|other"}}
            ],
            "safety_checks": [
                {{"step": 1, "check": "description of safety check for step 1"}},
                {{"step": 2, "check": "description of safety check for step 2"}}
            ]
        }}
        """
        return prompt

    def simulate_llm_response(self, intent: str, objects: list, locations: list) -> str:
        """Simulate LLM response for example purposes"""
        if intent == 'navigation':
            return """
            {
                "description": "Navigate to the specified location",
                "steps": [
                    {"action": "Identify current location using VSLAM", "type": "navigation"},
                    {"action": "Plan path to target location", "type": "navigation"},
                    {"action": "Navigate to destination using bipedal walking", "type": "navigation"}
                ],
                "safety_checks": [
                    {"step": 1, "check": "Validate current position is known"},
                    {"step": 2, "check": "Path is obstacle-free and safe for navigation"},
                    {"step": 3, "check": "Maintain safe distance from humans during movement"}
                ]
            }
            """
        elif intent == 'manipulation':
            return """
            {
                "description": "Pick up specified object",
                "steps": [
                    {"action": "Navigate to object location", "type": "navigation"},
                    {"action": "Detect and locate target object", "type": "manipulation"},
                    {"action": "Approach object safely", "type": "manipulation"},
                    {"action": "Grasp object with appropriate force", "type": "manipulation"}
                ],
                "safety_checks": [
                    {"step": 1, "check": "Path is clear of obstacles and humans"},
                    {"step": 2, "check": "Object is safe to handle"},
                    {"step": 3, "check": "Movement does not pose risk to environment"},
                    {"step": 4, "check": "Grasping force is appropriate for object"}
                ]
            }
            """
        else:
            return """
            {
                "description": "Execute general command",
                "steps": [
                    {"action": "Understand command intent", "type": "other"},
                    {"action": "Determine required actions", "type": "other"},
                    {"action": "Execute appropriate behavior", "type": "other"}
                ],
                "safety_checks": [
                    {"step": 1, "check": "Command is safe to execute"},
                    {"step": 2, "check": "Required actions are safe"},
                    {"step": 3, "check": "Execution maintains safety protocols"}
                ]
            }
            """

    def parse_plan_response(self, response_text: str, original_intent: str) -> dict:
        """Parse LLM response into structured action plan"""
        try:
            return json.loads(response_text.strip())
        except json.JSONDecodeError:
            self.get_logger().error(f'Failed to parse LLM response: {response_text}')
            # Return a default plan if parsing fails
            return {
                "description": f"Execute {original_intent} command",
                "steps": [{"action": "Execute command", "type": "other"}],
                "safety_checks": [{"step": 1, "check": "General safety validation"}]
            }
```

The Vision-Language-Action system provides the interface between human users and the humanoid robot, enabling natural and intuitive interaction. Proper implementation of safety overrides and transparency mechanisms ensures that these systems operate safely in human environments while maintaining the trust and control required for human-robot collaboration.