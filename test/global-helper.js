/**
 * グローバルヘルパー
 *
 * @ignore
 */
before((done) => {
    // ベーシック認証は解除する
    delete process.env.CHEVRE_BACKEND_BASIC_AUTH_NAME;
    delete process.env.CHEVRE_BACKEND_BASIC_AUTH_PASS;
    done();
});
