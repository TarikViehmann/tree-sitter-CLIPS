module.exports = grammar({
  name: 'clips',
  extras: $ => [
  $.comment_line,
  /[\s\t\n]/
  ],

  rules: {
    CLIPS_program: $ => choice(repeat($.construct),$.fact_query),
    global_assignment: $ => seq($.global_variable, '=', $._expression),

    global_variable: $ => /\?\*[^\s"()\&|<~]*\*/,

    _class_name: $ => $.name,
    _message_name: $ => $.name,
    _deftemplate_name: $ => $.name,
    _defmodule_name: $ => $.name,
    _superclass_name: $ => $.name,
    _definstances_name: $ => $.name,
    _module_name: $ => $.name,
    _construct_name: $ => $.name,
    name: $ => prec(1,$.symbol),
    string: $ => /"[^"]*"/,
    float: $ => prec(2,/[+-]?\d+\.\d+/),
    integer: $ => prec(1,/[+-]?\d+/),
    _index: $ => $.integer,
    instance_name: $ => seq('[', $.symbol, ']'),
    number: $ => prec(1,choice($.float, $.integer)),
    lexeme: $ => choice($.symbol, $.string),
    constant: $ => prec(2,choice($.number, $.string, $.symbol, $.instance_name)),
    comment: $ => prec(1,/"[^"]*"/),
    comment_line: $ => token(seq(';', /[^\n\r]*/)),
	symbol: $ => prec(3,/<?[a-zA-Z0-9_\-\/\+$\*][a-zA-Z0-9_\-\/\+$\*]*/),


    _variable_symbol: $ => $.symbol,
    function_name: $ =>  prec(2,choice($.symbol, "=", "<=", "<", ">", ">=", "<>")),
    //file_name: $ => choice($.symbol, $.string),
    _slot_name: $ => prec(1, $.name),
    _rule_name: $ => $.name,
    _fact_name: $ => $.name,

	single_field_variable: $ => prec.left(3,seq('?', $._variable_symbol)),
	multifield_variable: $ => prec(2, seq('$is?', $._variable_symbol)),
	special_variable: $ => prec(1,seq('?', $._variable_symbol, ':', $._slot_name)),

    //global_variable: $ => seq('?*', $.symbol, '*'),
    variable: $ => choice($.special_variable, $.single_field_variable, $.multifield_variable, $.global_variable),
	cond_body: $ => repeat1($._expression),
    then: $ => "then",
    else: $ => "else",
    if_statement: $ => seq('(', "if", $._expression,$.then, $.cond_body, optional(seq($.else, $.cond_body)), ')'),

    function_call: $ => choice($.fact_query, $.if_statement, seq('(', $.function_name, repeat($._expression), ')')),
    fact_query: $ => prec(1, choice($.any_factp_expression, $.find_fact_expression, $.find_all_facts_expression, $.do_for_fact_expression, $.do_for_all_facts_expression, $.delayed_do_for_all_facts_expression)),
    any_factp_expression: $ => seq(
  '(',
  'any-factp',
  $.fact_set_template,
  $.query,
  ')'
    ),
	find_fact_expression: $ => seq(
  '(',
  'find-fact',
  $.fact_set_template,
  $.query,
  ')'
),

find_all_facts_expression: $ => seq(
  '(',
  'find-all-facts',
  $.fact_set_template,
  $.query,
  ')'
),

do_for_fact_expression: $ => seq(
  '(',
  'do-for-fact',
  $.fact_set_template,
  $.query,
  repeat($.action),
  ')'
),

do_for_all_facts_expression: $ => seq(
  '(',
  'do-for-all-facts',
  $.fact_set_template,
  $.query,
  repeat($.action),
  ')'
),

delayed_do_for_all_facts_expression: $ => seq(
  '(',
  'delayed-do-for-all-facts',
  $.fact_set_template,
  $.query,
  repeat($.action),
  ')'
),

    query: $ => choice($._expression ),
    fact_set_template: $ => seq('(', repeat1($.fact_set_member_template), ')'),

    fact_set_member_template: $ => seq('(', $._fact_set_member_variable, $._deftemplate_restrictions, ')'),

    _fact_set_member_variable: $ => $.single_field_variable,

    _deftemplate_restrictions: $ => repeat1($._deftemplate_name_expression),
    _deftemplate_name_expression: $ => $._deftemplate_name, // Adjust this based on the actual definition of your _deftemplate_name_expression

    _expression: $ => choice($.constant, $.variable, $.function_call),
    _integer_expression: $ => $._expression,
    _instance_name_expression: $ => $._expression,
    _class_name_expression: $ => $._expression,
    _slot_name_expression: $ => $._expression,
    action: $ => $._expression,

    construct: $ => choice($.deffacts_construct, $.defglobal_construct, $.defrule_construct, $.deftemplate_construct ,$.deffunction_construct, $.defgeneric_construct, $.defmethod_construct, $.defclass_construct, $.definstances_construct, $.defmessage_handler_construct, $.defmodule_construct),
    defglobal_construct: $ => seq(
      '(defglobal',
      optional($.name),
      repeat($.global_assignment),
      ')'
    ),

    _deffacts_name: $ => $.name,
    defrule_construct: $ => seq('(', 'defrule', $._rule_name, $.defrule_body, ')'),
	defrule_body: $ => seq( optional($.comment), optional($.declaration), repeat($.conditional_element), '=>', repeat($.action) ),
    deffacts_construct: $ => seq('(','deffacts', $.symbol, optional($.comment), repeat($.deffacts_body), ')'),
	deffacts_body: $ => $.RHS_pattern,

    deftemplate_construct: $ => seq('(','deftemplate', $._deftemplate_name, optional($.comment), repeat($.slot_definition), ')'),
    slot_definition: $ => choice($.single_slot_definition, $.multislot_definition),
    single_slot_definition: $ => seq('(','slot', $._slot_name, repeat($.template_attribute), ')'),
    multislot_definition: $ => seq('(','multislot', $._slot_name, repeat($.template_attribute), ')'),
    template_attribute: $ => choice($.default_attribute, $.constraint_attribute),


    default_attribute: $ => choice(
      seq('(','default', optional(choice('?DERIVE', '?NONE', repeat1($._expression))), ')'),
      seq('(','default-dynamic', repeat($._expression), ')')
    ),

    template_RHS_pattern: $ => prec(1, seq('(', $._fact_name, repeat1($.RHS_slot), ')')),
    ordered_RHS_pattern: $ => prec(2,seq('(', $._fact_name, repeat($.RHS_field), ')')),


    RHS_slot: $ => prec(1,choice($.single_field_RHS_slot, $.multifield_RHS_slot)),
    RHS_field: $ => prec(2,choice($.variable, $.constant, $.function_call)),
    RHS_pattern: $ => choice($.template_RHS_pattern,$.ordered_RHS_pattern ),

    single_field_RHS_slot: $ => prec(1,seq('(', $._slot_name, $.RHS_field, ')')),

    multifield_RHS_slot: $ => seq('(', $._slot_name, repeat($.RHS_field), ')'),

    declaration: $ => seq('(','declare', repeat($.rule_property), ')'),

    rule_property: $ => choice(
      seq('(','salience', $._integer_expression, ')'),
      seq('(','auto-focus', $.boolean_symbol, ')')
    ),

    boolean_symbol: $ => choice('TRUE', 'FALSE'),

    conditional_element: $ => choice(
      $.pattern_CE,
      $.assigned_pattern_CE,
      $.not_CE,
      $.and_CE,
      $.or_CE,
      $.logical_CE,
      $.test_CE,
      $.exists_CE,
      $.forall_CE
    ),

    pattern_CE: $ => choice($.ordered_pattern_CE, $.template_pattern_CE, $.object_pattern_CE),

    assigned_pattern_CE: $ => prec(1, seq($.single_field_variable, '<-', $.pattern_CE)),

    not_CE: $ => seq('(','not', $.conditional_element, ')'),

    and_CE: $ => seq('(','and', repeat($.conditional_element), ')'),

    or_CE: $ => seq('(','or', repeat($.conditional_element), ')'),

    logical_CE: $ => seq('(','logical', repeat($.conditional_element), ')'),

    test_CE: $ => seq('(','test', $.function_call, ')'),

    exists_CE: $ => seq('(','exists', repeat($.conditional_element), ')'),

    forall_CE: $ => seq('(','forall', $.conditional_element, repeat($.conditional_element), ')'),

    ordered_pattern_CE: $ => seq('(', $._fact_name, repeat($.constraint), ')'),

    template_pattern_CE: $ => seq('(', $._deftemplate_name, repeat1($.LHS_slot), ')'),

    object_pattern_CE: $ => seq('(','object', repeat($.attribute_constraint), ')'),

	    attribute_constraint: $ => choice(
      seq('(','is-a', $.constraint, ')'),
      seq('(','name', $.constraint, ')'),
      seq('(', $._slot_name, repeat($.constraint), ')')
    ),


    constraint: $ => prec(4,choice('?', '$?', $.connected_constraint)),

    connected_constraint: $ => choice(
      $.single_constraint,
      seq($.single_constraint, '&', $.connected_constraint),
      seq($.single_constraint, '|', $.connected_constraint)
    ),

    single_constraint: $ => choice($.term, seq('~', $.term)),

    term: $ => choice(
      $.constant,
      $.single_field_variable,
      $.multifield_variable,
      seq(':', $.function_call),
      seq('=', $.function_call)
    ),
    LHS_slot: $ => choice($.single_field_LHS_slot, $.multifield_LHS_slot),

    single_field_LHS_slot: $ => prec(2,seq('(', $._slot_name, $.constraint, ')')),

    multifield_LHS_slot: $ => prec(1,seq('(', $._slot_name, repeat($.constraint), ')')),



    deffunction_construct: $ => seq(
      '(','deffunction',
      $.name,
      optional($.comment),
      seq('(', repeat($.regular_parameter), optional($.wildcard_parameter), ')'),
      repeat($.action),
      ')'
    ),

    regular_parameter: $ => $.single_field_variable,

    wildcard_parameter: $ => $.multifield_variable,

    defgeneric_construct: $ => seq(
      '(','defgeneric',
      $.name,
      optional($.comment),
      ')'
    ),

    defmethod_construct: $ => seq(
      '(','defmethod',
      $.name,
      optional($._index),
      optional($.comment),
      seq('(', repeat($.parameter_restriction), optional($.wildcard_parameter_restriction), ')'),
      repeat($.action),
      ')'
    ),

    parameter_restriction: $ => choice(
      $.single_field_variable,
      seq('(', $.single_field_variable, repeat($._type), optional($.other_query), ')')
    ),

    wildcard_parameter_restriction: $ => choice(
      $.multifield_variable,
      seq('(', $.multifield_variable, repeat($._type), optional($.other_query), ')')
    ),

    _type: $ => $._class_name,

    other_query: $ => choice($.global_variable, $.function_call),

    defclass_construct: $ => seq(
      '(','defclass',
      $.name,
      optional($.comment),
      seq('(','is-a', repeat($._superclass_name), ')'),
      optional($.role),
      optional($.pattern_match_role),
      repeat($.slot),
      repeat($.handler_documentation),
      ')'
    ),

    role: $ => seq('(','role', choice('concrete', 'abstract'), ')'),

    pattern_match_role: $ => seq('(','pattern-match', choice('reactive', 'non-reactive'), ')'),

    slot: $ => choice(
      seq('(','slot', $.name, repeat($.facet), ')'),
      seq('(','single-slot', $.name, repeat($.facet), ')'),
      seq('(','multislot', $.name, repeat($.facet), ')')
    ),

    facet: $ => choice(
      $.default_facet,
      $.storage_facet,
      $.access_facet,
      $.propagation_facet,
      $.source_facet,
      $.pattern_match_facet,
      $.visibility_facet,
      $.create_accessor_facet,
      $.override_message_facet,
      $.constraint_attribute
    ),

    default_facet: $ => seq('(','default', choice('?DERIVE', '?NONE', repeat($._expression)), ')'),

    storage_facet: $ => seq('(','storage', choice('local', 'shared'), ')'),

    access_facet: $ => seq('(','access', choice('read-write', 'read-only', 'initialize-only'), ')'),

    propagation_facet: $ => seq('(','propagation', choice('inherit', 'no-inherit'), ')'),

    source_facet: $ => seq('(','source', choice('exclusive', 'composite'), ')'),

    pattern_match_facet: $ => seq('(','pattern-match', choice('reactive', 'non-reactive'), ')'),

    visibility_facet: $ => seq('(','visibility', choice('private', 'public'), ')'),

    create_accessor_facet: $ => seq('(','create-accessor', choice('?NONE', 'read', 'write', 'read-write'), ')'),

    override_message_facet: $ => seq('(','override-message', choice('?DEFAULT', $._message_name), ')'),

    handler_documentation: $ => seq('(','message-handler', $.name, optional($.handler_type), ')'),

    handler_type: $ => choice('primary', 'around', 'before', 'after'),

    defmessage_handler_construct: $ => seq(
      '(','defmessage-handler',
      $._class_name,
      $._message_name,
      optional($.handler_type),
      optional($.comment),
      seq('(', repeat($.parameter), optional($.wildcard_parameter), ')'),
      repeat($.action),
      ')'
    ),
	parameter: $ => $.single_field_variable,

    wildcard_parameter: $ => $.multifield_variable,

    definstances_construct: $ => seq(
      '(','definstances',
      $._definstances_name,
      optional('active'),
      optional($.comment),
      repeat($.instance_template),
      ')'
    ),

    instance_template: $ => seq('(', $.instance_definition, ')'),

    instance_definition: $ => seq(
      $._instance_name_expression,
      'of',
      $._class_name_expression,
      repeat($.slot_override)
    ),

    slot_override: $ => seq(
      '(',
      $._slot_name_expression,
      repeat($._expression),
      ')'
    ),

    defmodule_construct: $ => seq(
      '(','defmodule',
      $._module_name,
      optional($.comment),
      repeat($.port_specification),
      ')'
    ),

    port_specification: $ => choice(
      seq('(','export', $.port_item, ')'),
      seq('(','import', $._module_name, $.port_item, ')')
    ),

    port_item: $ => choice(
      '?ALL',
      '?NONE',
      seq($.port_construct, '?ALL'),
      seq($.port_construct, '?NONE'),
      seq($.port_construct, repeat($._construct_name))
    ),

    port_construct: $ => choice('deftemplate', 'defclass', 'defglobal', 'deffunction', 'defgeneric'),

    constraint_attribute: $ => choice(
      $.type_attribute,
      $.allowed_constant_attribute,
      $.range_attribute,
      $.cardinality_attribute
    ),

    type_attribute: $ => seq('(','type', $.type_specification, ')'),

    type_specification: $ => choice(
      repeat1($.allowed_type),
      '?VARIABLE'
    ),

    allowed_type: $ => choice(
      'SYMBOL',
      'STRING',
      'LEXEME',
      'INTEGER',
      'FLOAT',
      'NUMBER',
      'INSTANCE-NAME',
      'INSTANCE-ADDRESS',
      'INSTANCE',
      'EXTERNAL-ADDRESS',
      'FACT-ADDRESS'
    ),

    allowed_constant_attribute: $ => choice(
      seq('(','allowed-symbols', $.symbol_list, ')'),
      seq('(','allowed-strings', $.string_list, ')'),
      seq('(','allowed-lexemes', $.lexeme_list, ')'),
      seq('(','allowed-integers', $.integer_list, ')'),
      seq('(','allowed-floats', $.float_list, ')'),
      seq('(','allowed-numbers', $.number_list, ')'),
      seq('(','allowed-instance-names', $.instance_name_list, ')'),
      seq('(','allowed-classes', $.class_name_list, ')'),
      seq('(','allowed-values', $.value_list, ')')
    ),

    symbol_list: $ => choice($.symbol, $.variable),

    string_list: $ => choice($.string, $.variable),

    lexeme_list: $ => choice($.lexeme, $.variable),

    integer_list: $ => choice($.integer, $.variable),

    float_list: $ => choice($.float, $.variable),

    number_list: $ => choice($.number, $.variable),

    instance_name_list: $ => choice($.instance_name, $.variable),

    class_name_list: $ => choice($._class_name, $.variable),

    value_list: $ => repeat1(choice($.constant, $.variable)),// '?VARIABLE')),

    range_attribute: $ => seq('(','range', $.range_specification, $.range_specification, ')'),

    range_specification: $ => choice($.number, $.variable),

    cardinality_attribute: $ => seq('(','cardinality', $.cardinality_specification, $.cardinality_specification, ')'),

    cardinality_specification: $ => choice($.integer, $.variable),
    // Add more rules for other constructs and elements

    // ...

    // Define additional rules as needed
  }
});
// Helper function to check if the current node is in the context of a query
function inQueryContext($) {
  // `$.has` checks if a certain node is an ancestor of the current node
  return $.has('query');
}

