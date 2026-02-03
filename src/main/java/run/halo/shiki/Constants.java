package run.halo.shiki;

public class Constants {
    static String PRE_STYLE = """
            <style class="pjax" data-pjax>
            shiki-code pre:has(code) {
                filter: blur(10px) !important;
                padding: 1rem !important;
            }
            </style>
        """;
}
