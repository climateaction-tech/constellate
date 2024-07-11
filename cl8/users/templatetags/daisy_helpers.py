from django import template

register = template.Library()


@register.filter
def message_tag_to_color(value):
    """
    Custom template filter that converts a message tag to a color, so we can use
    some of these default colors provided by Tailwind CSS provides, via
    Daisy our UI library:
    https://tailwindcss.com/docs/background-color
    https://tailwindcss.com/docs/customizing-colors#default-color-palette
    """
    matching_color = {
        "success": "green",
        "info": "blue",
        "warning": "yellow",
        "error": "red",
    }.get(value, "grey")

    return f"bg-{matching_color}-100"
