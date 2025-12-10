# URDF Models: Representing Humanoid Robot Structure

The Unified Robot Description Format (URDF) is an XML format for representing a robot model. In humanoid robotics, URDF is essential for describing the physical structure of robots, including links, joints, and their relationships. This chapter explores how to create and work with URDF models for humanoid robots.

## Introduction to URDF

URDF provides a way to describe robot models by defining:
- Links: Rigid bodies with physical properties
- Joints: Connections between links with kinematic properties
- Transmissions: Mapping between actuators and joints
- Gazebo plugins: Simulation-specific properties

## Basic URDF Structure

A basic humanoid robot URDF model looks like this:

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid">
  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.2 0.1 0.1"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <box size="0.2 0.1 0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10"/>
      <inertia ixx="1.0" ixy="0.0" ixz="0.0" iyy="1.0" iyz="0.0" izz="1.0"/>
    </inertial>
  </link>

  <!-- Torso -->
  <link name="torso">
    <visual>
      <geometry>
        <box size="0.15 0.1 0.3"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <box size="0.15 0.1 0.3"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="8"/>
      <inertia ixx="0.8" ixy="0.0" ixz="0.0" iyy="0.8" iyz="0.0" izz="0.8"/>
    </inertial>
  </link>

  <!-- Joint to connect base to torso -->
  <joint name="base_to_torso" type="fixed">
    <parent link="base_link"/>
    <child link="torso"/>
    <origin xyz="0 0 0.2" rpy="0 0 0"/>
  </joint>

  <!-- Head link -->
  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.07"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.07"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="2"/>
      <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.01"/>
    </inertial>
  </link>

  <!-- Joint to connect torso to head -->
  <joint name="torso_to_head" type="revolute">
    <parent link="torso"/>
    <child link="head"/>
    <origin xyz="0 0 0.2" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-1.57" upper="1.57" effort="100" velocity="1"/>
  </joint>
</robot>
```

## Safety Considerations in URDF Models

When creating URDF models for humanoid robots, safety is paramount:

### Joint Limits
```xml
<joint name="shoulder_pitch" type="revolute">
  <!-- Properly defined limits prevent dangerous movements -->
  <limit lower="-1.57" upper="1.57" effort="100" velocity="1"/>
</joint>
```

### Collision Avoidance
```xml
<!-- Properly defined collision geometries for collision detection -->
<link name="arm_link">
  <collision>
    <geometry>
      <!-- Use conservative collision shapes to ensure safety -->
      <capsule radius="0.05" length="0.3"/>
    </geometry>
  </collision>
</link>
```

### Mass and Inertia Properties
```xml
<!-- Accurate mass and inertia properties are crucial for safe control -->
<inertial>
  <mass value="2.5"/>
  <origin xyz="0 0 0.15" rpy="0 0 0"/>
  <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.02"/>
</inertial>
```

## Advanced URDF Features for Humanoids

### Transmission Elements
```xml
<!-- Define how actuators connect to joints -->
<transmission name="shoulder_pitch_trans">
  <type>transmission_interface/SimpleTransmission</type>
  <joint name="shoulder_pitch">
    <hardwareInterface>hardware_interface/PositionJointInterface</hardwareInterface>
  </joint>
  <actuator name="shoulder_pitch_motor">
    <hardwareInterface>hardware_interface/PositionJointInterface</hardwareInterface>
    <mechanicalReduction>1</mechanicalReduction>
  </actuator>
</transmission>
```

### Gazebo Integration
```xml
<!-- Gazebo-specific properties for simulation -->
<gazebo reference="torso">
  <material>Gazebo/Blue</material>
  <mu1>0.2</mu1>
  <mu2>0.2</mu2>
  <self_collide>true</self_collide>
  <gravity>true</gravity>
</gazebo>
```

## Tools for URDF Development

### Validation
URDF models should be validated for:
- Syntax correctness (XML parsing)
- Physical consistency (mass, inertia values)
- Kinematic feasibility (joint limits, connectivity)

### Visualization
Tools like RViz allow for real-time visualization of URDF models:
```bash
# Visualize the robot model in RViz
ros2 run rviz2 rviz2
```

### Kinematic Testing
Forward and inverse kinematics should be tested to ensure the model behaves as expected in simulation and real-world applications.

## Best Practices

1. **Start Simple**: Begin with a basic skeleton and incrementally add complexity
2. **Validate Regularly**: Check the model at each stage of development
3. **Use Standard Formats**: Follow established conventions for link and joint naming
4. **Consider Safety**: Always include proper joint limits and collision geometries
5. **Documentation**: Include comments in the URDF to explain complex sections

URDF models form the foundation of humanoid robotics, providing the structural representation necessary for simulation, control, and safety validation. With proper construction and safety considerations, URDF models enable the safe operation of complex humanoid robots in human environments.