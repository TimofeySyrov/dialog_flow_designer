import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Turn } from "../types";

import Node from "../components/Node/Node";

export default {
  component: Node,
} as ComponentMeta<typeof Node>;

const Template: ComponentStory<typeof Node> = (args) => <Node {...args} />;

export const StarterNode = Template.bind({});
StarterNode.args = {
  node: {
    id: "id",
    label: "Start Node",
    turn: Turn.BOT,
    flow: "flow",
    properties: [],
  },
  starter: true,
};

export const BotNode = Template.bind({});
BotNode.args = {
  node: {
    id: "id",
    label: "Bot Node",
    turn: Turn.BOT,
    flow: "flow",
    properties: [],
  },
};

export const UserNode = Template.bind({});
UserNode.args = {
  node: {
    id: "id",
    label: "User Node",
    turn: Turn.USER,
    flow: "flow",
    properties: [],
  },
};

export const SelectedNode = Template.bind({});
SelectedNode.args = {
  ...UserNode.args,
  selected: true,
};
