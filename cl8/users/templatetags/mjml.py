import logging

from django import template
from mjml import mjml2html

logger = logging.getLogger(__name__)
# Used for convenience to see the contents of a template
# before is passed as to convert from mjml to html for email
# logger.setLevel(logging.DEBUG)  

register = template.Library()


class MJMLRenderNode(template.Node):
    def __init__(self, nodelist):
        self.nodelist = nodelist

    def render(self, context) -> str:
        mjml_source = self.nodelist.render(context)
        return mjml_render(mjml_source)


@register.tag
def mjml(parser, token) -> MJMLRenderNode:
    """
    Compile MJML template after render django template.

    Usage:
        {% mjml %}
            .. MJML template code ..
        {% endmjml %}
    """
    nodelist = parser.parse(("endmjml",))
    parser.delete_first_token()
    tokens = token.split_contents()
    if len(tokens) != 1:
        raise template.TemplateSyntaxError(
            "'%r' tag doesn't receive any arguments." % tokens[0]
        )
    return MJMLRenderNode(nodelist)


def mjml_render(mjml_source: str) -> str:
    """
    Render the provided MJML template string, with template context
    already added. Returns the html formatted for email clients.
    """
    logger.debug(mjml_source)

    # Tip: mjml2html does not give very helpful error messages.
    # Paste the `mjml_source` string into a validator like the one 
    # below if is raising errors
    # https://mjml.io/try-it-live/
    
    return mjml2html(mjml_source)
