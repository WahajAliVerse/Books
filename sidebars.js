// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      items: [
        'intro',
      ],
      collapsed: false,
    },
    {
      type: 'category',
      label: 'Chapter 1: The Robotic Nervous System (ROS 2)',
      items: [
        'chapter1/index',
        'chapter1/rclpy-bridges',
        'chapter1/urdf-models',
        'chapter1/safety-principles',
      ],
      collapsed: false,
    },
    {
      type: 'category',
      label: 'Chapter 2: The Digital Twin (Gazebo & Unity)',
      items: [
        'chapter2/index',
        'chapter2/physics-sim',
        'chapter2/sensor-examples',
        'chapter2/sim-to-reality',
      ],
      collapsed: false,
    },
    {
      type: 'category',
      label: 'Chapter 3: The AI-Robot Brain (NVIDIA Isaac)',
      items: [
        'chapter3/index',
        'chapter3/isaac-sim',
        'chapter3/vslam',
        'chapter3/bipedal-nav',
        'chapter3/ai-transparency',
      ],
      collapsed: false,
    },
    {
      type: 'category',
      label: 'Chapter 4: Vision-Language-Action (VLA)',
      items: [
        'chapter4/index',
        'chapter4/voice-to-action',
        'chapter4/llm-planning',
        'chapter4/capstone-project',
      ],
      collapsed: false,
    },
    {
      type: 'doc',
      id: 'conclusion',
    },
  ],
};

module.exports = sidebars;