﻿export type TreeNode = {
    type: NodeType;
    id: string;
    name: string;
    x: number;
    y: number;
    parentId?: string; // ID of the parent node
    childrenIds?: string[]; // Array of IDs representing the children in order
};

type NodeInput = {
    type: string;
    required: boolean;
    description: string;
};


type NodeDetails = {
    description: string;
    inputs: NodeInput[];
    canHaveChildren: boolean;
    isDecorator:boolean
};

export enum NodeType {
    Select = 'SelectNode',
    Sequence = 'SequenceNode',
    Parallel = 'ParallelNode',
    Invert = 'InvertNode',
    Repeat = 'RepeatNode',
    Retry = 'RetryNode',
    Action = 'ActionNode',
    Wait = 'WaitNode',
    RandomSelector = 'RandomSelector',
    Failer = 'FailerNode',
    Succeeder = 'SucceederNode',
    Loop = 'LoopNode',
}

export const NodeDetails: Record<NodeType, NodeDetails> = {
    [NodeType.Select]: {
        description: 'Returns the first successful child or failure if all children fail',
        inputs: [{type: 'name', required: true, description: 'The name of the node'},],
        canHaveChildren: true,
        isDecorator:false
    },
    [NodeType.Sequence]: {
        description: 'Returns success only if all children succeed in order',
        inputs: [{type: 'name', required: true, description: 'The name of the node'},],
        canHaveChildren: true,
        isDecorator:false
    },
    [NodeType.Parallel]: {
        description: 'Runs all children simultaneously, returning success based on a success percentage',
        inputs: [
            {type: 'name', required: true, description: 'The name of the node'},
            {
                type: 'percentage',
                required: true,
                description: 'Percentage of nodes that need to have succeeded for this node to succeed'
            },
        ],
        canHaveChildren: true,
        isDecorator:false
    },
    [NodeType.Invert]: {
        description: 'Inverts the result of its child',
        inputs: [{type: 'name', required: true, description: 'The name of the node'},],
        canHaveChildren: true,
        isDecorator:true
    },
    [NodeType.Repeat]: {
        description: 'Repeats its child the specified number of times or until failure',
        inputs: [
            {type: 'name', required: true, description: 'Name of the node.'},
            {type: 'repeatCount', required: true, description: 'Number of times to repeat the node.'},
        ],
        canHaveChildren: true,
        isDecorator:true
    },
    [NodeType.Retry]: {
        description: 'Retries its child the specified number of times or until success',
        inputs: [
            {type: 'name', required: true, description: 'Name of the node.'},
            {type: 'repeatCount', required: true, description: 'Number of times to retry the node.'},
        ],
        canHaveChildren: true,
        isDecorator:true
    },
    [NodeType.Action]: {
        description: 'The `ActionNode` is a specific node type in a Behavior Tree system. It represents an action that can be performed and encapsulates the logic required to execute it.',
        inputs: [
            {type: 'name', required: true, description: 'Name of the Action node.'},
            {type: 'actionName', required: true, description: 'Name of the action to perform.'},
            {
                type: 'paramKeys',
                required: false,
                description: 'Keys used to extract the parameters from the blackboard.'
            },
        ],
        canHaveChildren: false,
        isDecorator:false
    },
    [NodeType.Wait]: {
        description: 'The `WaitNode` waits for a specified amount of time or until a condition is met.',
        inputs: [
            {type: 'name', required: true, description: 'Name of the Wait node.'},
            {type: 'time', required: true, description: 'Time to wait in seconds.'},
            {
                type: 'condition',
                required: false,
                description: 'A function that returns a boolean. If true, the node will succeed before the time has elapsed.'
            },
        ],
        canHaveChildren: false,
        isDecorator:false
    },
    [NodeType.RandomSelector]: {
        description: 'The `RandomSelector` randomly shuffles its children and then behaves like a regular selector, choosing the first child that succeeds.',
        inputs: [{type: 'name', required: true, description: 'The name of the node'},],
        canHaveChildren: true,
        isDecorator:false
    },
    [NodeType.Failer]: {
        description: 'The `FailerNode` always returns a failure status.',
        inputs: [{type: 'name', required: true, description: 'The name of the node'},],
        canHaveChildren: false,
        isDecorator:false
    },
    [NodeType.Succeeder]: {
        description: 'The `SucceederNode` always returns a success status.',
        inputs: [{type: 'name', required: true, description: 'The name of the node'},],
        canHaveChildren: false,
        isDecorator:false
    },
    [NodeType.Loop]: {
        description: 'The `LoopNode` executes its child node a specified number of times.',
        inputs: [
            {type: 'name', required: true, description: 'Name of the Loop node.'},
            {type: 'loopCount', required: true, description: 'Number of times to execute the child node.'},
        ],
        canHaveChildren: true,
        isDecorator:true
    }
} as Record<NodeType, NodeDetails>;