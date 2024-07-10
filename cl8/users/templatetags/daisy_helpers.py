from django import template

register = template.Library()


@register.filter
def message_tag_to_color(value):
    """
    Custom template filter that acts like the builtin "yesno" filter,
    but is only applied to certain values: explicitly True, False, None and "".
    """
    matching_color = {
        "success": "green",
        "info": "blue",
        "warning": "yellow",
        "error": "red",
    }.get(value, "grey")

    return f"bg-{matching_color}-100"
